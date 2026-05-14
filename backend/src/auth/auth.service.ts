import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { OnboardingState, PublicUser } from '../users/user.types';

export interface AuthResult {
  token: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signUp(body: Record<string, unknown>): Promise<AuthResult> {
    const email = this.readEmail(body.email);
    const password = this.readPassword(body.password);
    const onboarding = this.readOnboarding(body.onboarding);
    const providedName = this.readOptionalText(body.name, 2);
    const providedUsername = this.readOptionalText(body.username, 3);
    const generatedIdentity = this.buildStarterIdentity(email, providedName, providedUsername);

    const user = await this.usersService.createUser({
      name: generatedIdentity.name,
      username: generatedIdentity.username,
      email,
      passwordHash: this.hashPassword(password),
      onboarding,
    });

    const token = await this.usersService.createSession(user.id);

    return {
      token,
      user: this.usersService.toPublicUser(user),
    };
  }

  async login(body: Record<string, unknown>): Promise<AuthResult> {
    const email = this.readEmail(body.email);
    const password = this.readPassword(body.password);
    const user = await this.usersService.findByEmail(email);

    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Your email or password did not match.');
    }

    const token = await this.usersService.createSession(user.id);

    return {
      token,
      user: this.usersService.toPublicUser(user),
    };
  }

  async logout(header?: string): Promise<void> {
    const token = this.extractToken(header);
    await this.usersService.deleteSession(token);
  }

  private buildStarterIdentity(
    email: string,
    preferredName?: string,
    preferredUsername?: string,
  ): { name: string; username: string } {
    const localPart = email.split('@')[0] ?? 'learner';
    const cleaned = localPart
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const usernameBase = cleaned || 'learner';
    const nameBase = localPart
      .replace(/[._-]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (character) => character.toUpperCase());

    return {
      name: preferredName ?? nameBase ?? 'New Learner',
      username: preferredUsername ?? usernameBase,
    };
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

  private readOptionalText(value: unknown, minLength: number): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('Optional sign-up fields must be text.');
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    if (trimmed.length < minLength) {
      throw new BadRequestException(
        `Optional sign-up fields must be at least ${minLength} characters long if you fill them in.`,
      );
    }

    return trimmed;
  }

  private readEmail(value: unknown): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Email is required.');
    }

    const trimmed = value.trim().toLowerCase();

    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      throw new BadRequestException('Please enter a valid email address.');
    }

    return trimmed;
  }

  private readPassword(value: unknown): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Password is required.');
    }

    if (value.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long.');
    }

    return value;
  }

  private readOnboarding(value: unknown): OnboardingState | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== 'object') {
      throw new BadRequestException('Onboarding data must be an object.');
    }

    const onboarding = value as Partial<OnboardingState>;

    return {
      skipped: Boolean(onboarding.skipped),
      answers:
        onboarding.answers && typeof onboarding.answers === 'object'
          ? (onboarding.answers as OnboardingState['answers'])
          : {},
    };
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derivedKey}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');

    if (!salt || !key) {
      return false;
    }

    const derivedKey = scryptSync(password, salt, 64);
    const storedKeyBuffer = Buffer.from(key, 'hex');

    if (storedKeyBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedKeyBuffer, derivedKey);
  }

  private extractToken(header?: string): string {
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token.');
    }

    return header.slice(7).trim();
  }
}
