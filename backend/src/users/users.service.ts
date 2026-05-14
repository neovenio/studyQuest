import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import { DataStoreService } from '../data/data-store.service';
import {
  OnboardingAnswers,
  OnboardingState,
  PublicUser,
  SessionRecord,
  UserRecord,
} from './user.types';

interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  onboarding?: OnboardingState;
}

const avatarChoices = new Set(['comet', 'fox', 'owl', 'whale']);
const themeChoices = new Set(['light', 'dark', 'system']);
const goalChoices = new Set(['better-grades', 'focus-better', 'stay-consistent', 'manage-time']);
const struggleChoices = new Set(['starting', 'focus', 'remembering', 'planning']);
const studyChoices = new Set(['school-subjects', 'exam-prep', 'coding', 'languages']);
const sessionChoices = new Set(['15', '25', '45', '60']);

const recommendations: Record<string, { title: string; reason: string }> = {
  focus: {
    title: 'Pomodoro Focus Foundations',
    reason: 'You said focus is your biggest challenge, so short guided focus sprints are a strong first unlock.',
  },
  remembering: {
    title: 'Active Recall Foundations',
    reason: 'You want to remember more of what you study, so retrieval practice is the strongest place to begin.',
  },
  planning: {
    title: 'Study Session Blueprint',
    reason: 'Better planning makes the rest of your study tools easier to use consistently.',
  },
  starting: {
    title: 'Momentum Kickstart',
    reason: 'A gentle starting routine can make big tasks feel smaller and easier to begin.',
  },
};

@Injectable()
export class UsersService {
  constructor(private readonly dataStore: DataStoreService) {}

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    return this.dataStore.mutate((data) => {
      const email = input.email.toLowerCase();
      const username = this.makeUniqueUsername(input.username, data.users);

      const emailTaken = data.users.some((user) => user.email === email);
      if (emailTaken) {
        throw new ConflictException('That email is already in use.');
      }

      const now = new Date().toISOString();
      const normalizedOnboarding = this.normalizeOnboarding(input.onboarding);

      const newUser: UserRecord = {
        id: randomUUID(),
        name: input.name,
        username,
        email,
        passwordHash: input.passwordHash,
        bio: '',
        profilePicture: 'comet',
        themePreference: 'system',
        mainGoal: normalizedOnboarding.answers.mainGoal,
        biggestStruggle: normalizedOnboarding.answers.biggestStruggle,
        whatTheyStudy: normalizedOnboarding.answers.whatTheyStudy,
        preferredSessionLength: normalizedOnboarding.answers.preferredSessionLength,
        onboardingCompleted: normalizedOnboarding.completed,
        onboardingSkipped: normalizedOnboarding.skipped,
        createdAt: now,
        updatedAt: now,
      };

      data.users.push(newUser);
      return newUser;
    });
  }

  async createSession(userId: string): Promise<string> {
    return this.dataStore.mutate((data) => {
      const token = randomBytes(24).toString('hex');
      const session: SessionRecord = {
        token,
        userId,
        createdAt: new Date().toISOString(),
      };

      data.sessions.push(session);
      return token;
    });
  }

  async deleteSession(token: string): Promise<void> {
    await this.dataStore.mutate((data) => {
      data.sessions = data.sessions.filter((session) => session.token !== token);
    });
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const data = await this.dataStore.readData();
    return data.users.find((user) => user.email === email.toLowerCase());
  }

  async getPublicUserFromToken(header?: string): Promise<PublicUser> {
    const user = await this.getUserFromHeader(header);
    return this.toPublicUser(user);
  }

  async updateCurrentUser(
    header: string | undefined,
    body: Record<string, unknown>,
  ): Promise<PublicUser> {
    return this.dataStore.mutate((data) => {
      const token = this.extractToken(header);
      const session = data.sessions.find((currentSession) => currentSession.token === token);

      if (!session) {
        throw new UnauthorizedException('Please log in again.');
      }

      const user = data.users.find((currentUser) => currentUser.id === session.userId);

      if (!user) {
        throw new UnauthorizedException('Please log in again.');
      }

      const nextName = this.readRequiredText(body.name, 'Name', 2);
      const nextUsername = this.readRequiredText(body.username, 'Username', 3);
      const nextBio = this.readOptionalText(body.bio, 240);
      const nextProfilePicture = this.readChoice(
        body.profilePicture,
        avatarChoices,
        'profile picture',
      );
      const nextThemePreference = this.readChoice(
        body.themePreference,
        themeChoices,
        'theme preference',
      );
      const nextMainGoal = this.readChoice(body.mainGoal, goalChoices, 'main goal');
      const nextBiggestStruggle = this.readChoice(
        body.biggestStruggle,
        struggleChoices,
        'biggest struggle',
      );
      const nextWhatTheyStudy = this.readChoice(
        body.whatTheyStudy,
        studyChoices,
        'study focus',
      );
      const nextSessionLength = this.readChoice(
        body.preferredSessionLength,
        sessionChoices,
        'preferred session length',
      );

      const usernameTaken = data.users.some(
        (otherUser) =>
          otherUser.id !== user.id &&
          otherUser.username.toLowerCase() === nextUsername.toLowerCase(),
      );

      if (usernameTaken) {
        throw new ConflictException('That username is already taken.');
      }

      user.name = nextName;
      user.username = nextUsername;
      user.bio = nextBio;
      user.profilePicture = nextProfilePicture;
      user.themePreference = nextThemePreference as UserRecord['themePreference'];
      user.mainGoal = nextMainGoal;
      user.biggestStruggle = nextBiggestStruggle;
      user.whatTheyStudy = nextWhatTheyStudy;
      user.preferredSessionLength = nextSessionLength;
      user.onboardingCompleted = true;
      user.onboardingSkipped = false;
      user.updatedAt = new Date().toISOString();

      return this.toPublicUser(user);
    });
  }

  async completeOnboarding(
    header: string | undefined,
    body: Record<string, unknown>,
  ): Promise<PublicUser> {
    return this.dataStore.mutate((data) => {
      const user = this.getCurrentUserFromData(data, header);
      const onboardingAnswers = this.readOnboardingAnswers(body);

      user.mainGoal = onboardingAnswers.mainGoal;
      user.biggestStruggle = onboardingAnswers.biggestStruggle;
      user.whatTheyStudy = onboardingAnswers.whatTheyStudy;
      user.preferredSessionLength = onboardingAnswers.preferredSessionLength;
      user.onboardingCompleted = true;
      user.onboardingSkipped = false;
      user.updatedAt = new Date().toISOString();

      return this.toPublicUser(user);
    });
  }

  toPublicUser(user: UserRecord): PublicUser {
    const recommendation =
      recommendations[user.biggestStruggle ?? ''] ?? {
        title: 'StudyQuest Starter Path',
        reason: 'Once your preferences are set, StudyQuest can guide you toward your first level.',
      };

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      themePreference: user.themePreference ?? 'system',
      mainGoal: user.mainGoal,
      biggestStruggle: user.biggestStruggle,
      whatTheyStudy: user.whatTheyStudy,
      preferredSessionLength: user.preferredSessionLength,
      onboardingCompleted: user.onboardingCompleted,
      onboardingSkipped: user.onboardingSkipped,
      recommendedQuest: recommendation.title,
      recommendedQuestReason: recommendation.reason,
    };
  }

  private async getUserFromHeader(header?: string): Promise<UserRecord> {
    const token = this.extractToken(header);
    const data = await this.dataStore.readData();
    const session = data.sessions.find((currentSession) => currentSession.token === token);

    if (!session) {
      throw new UnauthorizedException('Please log in again.');
    }

    const user = data.users.find((currentUser) => currentUser.id === session.userId);

    if (!user) {
      throw new UnauthorizedException('Please log in again.');
    }

    return user;
  }

  private getCurrentUserFromData(
    data: { users: UserRecord[]; sessions: SessionRecord[] },
    header?: string,
  ): UserRecord {
    const token = this.extractToken(header);
    const session = data.sessions.find((currentSession) => currentSession.token === token);

    if (!session) {
      throw new UnauthorizedException('Please log in again.');
    }

    const user = data.users.find((currentUser) => currentUser.id === session.userId);

    if (!user) {
      throw new UnauthorizedException('Please log in again.');
    }

    return user;
  }

  private extractToken(header?: string): string {
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token.');
    }

    return header.slice(7).trim();
  }

  private normalizeOnboarding(onboarding?: OnboardingState): {
    answers: OnboardingAnswers;
    completed: boolean;
    skipped: boolean;
  } {
    if (!onboarding) {
      return {
        answers: {},
        completed: false,
        skipped: false,
      };
    }

    if (onboarding.skipped) {
      return {
        answers: {},
        completed: true,
        skipped: true,
      };
    }

    const answers = onboarding.answers ?? {};

    return {
      answers: {
        mainGoal: this.optionalChoice(answers.mainGoal, goalChoices),
        biggestStruggle: this.optionalChoice(answers.biggestStruggle, struggleChoices),
        whatTheyStudy: this.optionalChoice(answers.whatTheyStudy, studyChoices),
        preferredSessionLength: this.optionalChoice(
          answers.preferredSessionLength,
          sessionChoices,
        ),
      },
      completed: true,
      skipped: false,
    };
  }

  private optionalChoice(
    value: string | undefined,
    allowedValues: Set<string>,
  ): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (!allowedValues.has(value)) {
      throw new BadRequestException('One of the onboarding answers was invalid.');
    }

    return value;
  }

  private readRequiredText(value: unknown, label: string, minLength: number): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(`${label} is required.`);
    }

    const trimmed = value.trim();

    if (trimmed.length < minLength) {
      throw new BadRequestException(`${label} must be at least ${minLength} characters long.`);
    }

    return trimmed;
  }

  private readOptionalText(value: unknown, maxLength: number): string {
    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('Bio must be plain text.');
    }

    const trimmed = value.trim();

    if (trimmed.length > maxLength) {
      throw new BadRequestException(`Bio must stay under ${maxLength} characters.`);
    }

    return trimmed;
  }

  private readChoice(value: unknown, allowedValues: Set<string>, label: string): string {
    if (typeof value !== 'string' || !allowedValues.has(value)) {
      throw new BadRequestException(`Please choose a valid ${label}.`);
    }

    return value;
  }

  private makeUniqueUsername(baseUsername: string, users: UserRecord[]): string {
    const normalizedBase =
      baseUsername
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-') || 'learner';

    if (!users.some((user) => user.username.toLowerCase() === normalizedBase)) {
      return normalizedBase;
    }

    let attempt = 2;

    while (users.some((user) => user.username.toLowerCase() === `${normalizedBase}-${attempt}`)) {
      attempt += 1;
    }

    return `${normalizedBase}-${attempt}`;
  }

  private readOnboardingAnswers(body: Record<string, unknown>): Required<OnboardingAnswers> {
    return {
      mainGoal: this.readChoice(body.mainGoal, goalChoices, 'main goal'),
      biggestStruggle: this.readChoice(
        body.biggestStruggle,
        struggleChoices,
        'biggest struggle',
      ),
      whatTheyStudy: this.readChoice(body.whatTheyStudy, studyChoices, 'study focus'),
      preferredSessionLength: this.readChoice(
        body.preferredSessionLength,
        sessionChoices,
        'preferred session length',
      ),
    };
  }
}
