import { Injectable, signal } from '@angular/core';
import { ThemePreference } from '../models/studyquest';

type ResolvedTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'studyquest-theme-preference';
  private mediaQuery: MediaQueryList | null = null;

  readonly preference = signal<ThemePreference>('system');
  readonly resolvedTheme = signal<ResolvedTheme>('light');

  initialize(initialPreference?: ThemePreference): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);

    const storedPreference = this.readStoredPreference();
    const nextPreference = initialPreference ?? storedPreference ?? 'system';
    this.setPreference(nextPreference);
  }

  setPreference(preference: ThemePreference, persist = true): void {
    this.preference.set(preference);

    if (persist) {
      localStorage.setItem(this.storageKey, preference);
    }

    this.applyTheme(preference);
  }

  previewPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    this.applyTheme(preference);
  }

  syncFromUser(preference?: ThemePreference): void {
    const nextPreference = preference ?? this.readStoredPreference() ?? 'system';
    this.setPreference(nextPreference);
  }

  private readonly handleSystemThemeChange = (): void => {
    if (this.preference() === 'system') {
      this.applyTheme('system');
    }
  };

  private applyTheme(preference: ThemePreference): void {
    if (typeof document === 'undefined') {
      return;
    }

    const resolvedTheme = this.resolveTheme(preference);
    document.documentElement.dataset['theme'] = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
    this.resolvedTheme.set(resolvedTheme);
  }

  private resolveTheme(preference: ThemePreference): ResolvedTheme {
    if (preference === 'system') {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }

    return preference;
  }

  private readStoredPreference(): ThemePreference | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const value = localStorage.getItem(this.storageKey);

    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }

    return null;
  }
}
