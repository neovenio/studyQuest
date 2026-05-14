import { Injectable, inject, signal } from '@angular/core';
import { AuthResponse, PublicUser } from '../models/studyquest';
import { ThemeService } from './theme.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly themeService = inject(ThemeService);
  private readonly tokenKey = 'studyquest-token';
  private readonly userKey = 'studyquest-user';

  private readonly tokenSignal = signal<string | null>(this.readString(this.tokenKey));
  private readonly userSignal = signal<PublicUser | null>(
    this.readJson<PublicUser | null>(this.userKey, null),
  );

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();

  constructor() {
    this.themeService.syncFromUser(this.userSignal()?.themePreference);
  }

  setAuth(response: AuthResponse): void {
    this.tokenSignal.set(response.token);
    this.userSignal.set(response.user);
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.themeService.syncFromUser(response.user.themePreference);
  }

  patchUser(user: PublicUser): void {
    this.userSignal.set(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.themeService.syncFromUser(user.themePreference);
  }

  clearAuth(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  private readString(key: string): string | null {
    return localStorage.getItem(key);
  }

  private readJson<T>(key: string, fallback: T): T {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return fallback;
    }
  }
}
