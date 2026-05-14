export interface OnboardingAnswers {
  mainGoal: string;
  biggestStruggle: string;
  whatTheyStudy: string;
  preferredSessionLength: string;
}

export interface OnboardingState {
  skipped: boolean;
  answers: Partial<OnboardingAnswers>;
}

export interface PublicUser extends Partial<OnboardingAnswers> {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  themePreference: ThemePreference;
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
  recommendedQuest: string;
  recommendedQuestReason: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface SignUpPayload {
  name?: string;
  username?: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CompleteOnboardingPayload extends OnboardingAnswers {}

export interface UpdateProfilePayload extends Partial<OnboardingAnswers> {
  name: string;
  username: string;
  bio: string;
  profilePicture: string;
  themePreference: ThemePreference;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface ChoiceOption {
  value: string;
  label: string;
  hint: string;
}

export interface AvatarOption {
  value: string;
  label: string;
  emoji: string;
  glow: string;
}

export const themePreferenceOptions: ChoiceOption[] = [
  {
    value: 'light',
    label: 'Light mode',
    hint: 'Keep the soft blue daytime look.',
  },
  {
    value: 'dark',
    label: 'Dark mode',
    hint: 'Switch to a calmer night version of the app.',
  },
  {
    value: 'system',
    label: 'Use device setting',
    hint: 'Match whatever your phone or computer is using.',
  },
];

export const mainGoalOptions: ChoiceOption[] = [
  {
    value: 'better-grades',
    label: 'Get better grades',
    hint: 'You want a stronger system that helps school feel less chaotic.',
  },
  {
    value: 'focus-better',
    label: 'Focus better',
    hint: 'You want fewer distracted sessions and more deep work.',
  },
  {
    value: 'stay-consistent',
    label: 'Stay consistent',
    hint: 'You want a routine that you can actually keep up.',
  },
  {
    value: 'manage-time',
    label: 'Manage time better',
    hint: 'You want study time to feel more planned and less rushed.',
  },
];

export const biggestStruggleOptions: ChoiceOption[] = [
  {
    value: 'starting',
    label: 'Starting at all',
    hint: 'You know what to do, but getting started feels heavy.',
  },
  {
    value: 'focus',
    label: 'Staying focused',
    hint: 'You begin okay, then your attention drifts away.',
  },
  {
    value: 'remembering',
    label: 'Remembering what I study',
    hint: 'You revise, but the information slips away later.',
  },
  {
    value: 'planning',
    label: 'Planning my time',
    hint: 'You need help breaking work into realistic sessions.',
  },
];

export const studyTopicOptions: ChoiceOption[] = [
  {
    value: 'school-subjects',
    label: 'School subjects',
    hint: 'Homework, tests, and regular classes.',
  },
  {
    value: 'exam-prep',
    label: 'Exam prep',
    hint: 'You are studying toward a test or important assessment.',
  },
  {
    value: 'coding',
    label: 'Coding',
    hint: 'Programming, web development, or technical practice.',
  },
  {
    value: 'languages',
    label: 'Languages',
    hint: 'Vocabulary, grammar, or speaking practice.',
  },
];

export const sessionLengthOptions: ChoiceOption[] = [
  {
    value: '15',
    label: '15 minutes',
    hint: 'Best when you want to make starting feel easy.',
  },
  {
    value: '25',
    label: '25 minutes',
    hint: 'Classic Pomodoro length and a strong default choice.',
  },
  {
    value: '45',
    label: '45 minutes',
    hint: 'Long enough for deeper work without being overwhelming.',
  },
  {
    value: '60',
    label: '60 minutes or more',
    hint: 'You prefer long stretches of focused study.',
  },
];

export const avatarOptions: AvatarOption[] = [
  { value: 'comet', label: 'Comet', emoji: '☄️', glow: '#f2b441' },
  { value: 'fox', label: 'Fox', emoji: '🦊', glow: '#dd6a32' },
  { value: 'owl', label: 'Owl', emoji: '🦉', glow: '#8d6df8' },
  { value: 'whale', label: 'Whale', emoji: '🐋', glow: '#3b8769' },
];

const optionLookup = new Map<string, string>();

for (const option of [
  ...mainGoalOptions,
  ...biggestStruggleOptions,
  ...studyTopicOptions,
  ...sessionLengthOptions,
  ...themePreferenceOptions,
]) {
  optionLookup.set(option.value, option.label);
}

export function getOptionLabel(value: string | null | undefined): string {
  if (!value) {
    return 'Not set yet';
  }

  return optionLookup.get(value) ?? value;
}

export function getAvatar(value: string | null | undefined): AvatarOption {
  return avatarOptions.find((avatar) => avatar.value === value) ?? avatarOptions[0];
}

export function getDisplayName(user: Pick<PublicUser, 'name' | 'username' | 'email'>): string {
  const preferredName = user.name?.trim();

  if (preferredName) {
    return preferredName;
  }

  const username = user.username?.trim();

  if (username) {
    return username;
  }

  return user.email.split('@')[0];
}
