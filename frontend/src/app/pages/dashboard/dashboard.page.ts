import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  getAvatar,
  getDisplayName,
  getOptionLabel,
  PublicUser,
} from '../../core/models/studyquest';
import { ApiService } from '../../core/services/api.service';
import { SessionService } from '../../core/services/session.service';

interface DashboardMeeting {
  day: string;
  time: string;
  title: string;
  channel: string;
}

interface DashboardArea {
  label: string;
  value: number;
  direction: 'up' | 'down';
}

interface TrackerConnection {
  short: string;
  label: string;
}

interface ToolUnlock {
  icon: string;
  title: string;
  copy: string;
  tone: 'cyan' | 'lime' | 'magenta';
}

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPageComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  readonly currentUser = this.session.user;
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly navHidden = signal(false);

  readonly avatar = computed(() => getAvatar(this.currentUser()?.profilePicture));
  readonly displayName = computed(() => {
    const user = this.currentUser();
    return user ? getDisplayName(user) : 'learner';
  });

  readonly dashboardStats = computed(() => {
    const user = this.currentUser();

    if (!user) {
      return {
        priority: 0,
        additional: 0,
        focusAverage: 0,
      };
    }

    return {
      priority: this.metricFromUser(user, 'priority', 72, 18),
      additional: this.metricFromUser(user, 'additional', 48, 20),
      focusAverage: this.metricFromUser(user, 'focus', 34, 42),
    };
  });

  readonly profileStats = computed(() => {
    const user = this.currentUser();

    if (!user) {
      return { route: 0, focus: 0, xp: 0 };
    }

    return {
      route: this.metricFromUser(user, 'route', 3, 7),
      focus: this.metricFromUser(user, 'mini-focus', 12, 18),
      xp: this.metricFromUser(user, 'xp', 80, 70),
    };
  });

  readonly meetings = computed(() => this.buildMeetings(this.currentUser()));
  readonly developedAreas = computed(() => this.buildAreas(this.currentUser()));
  readonly trackerConnections = computed(() => this.buildTrackers(this.currentUser()));
  readonly toolUnlocks = computed(() => this.buildToolUnlocks(this.currentUser()));

  constructor() {
    void this.loadDashboard();
  }

  toggleNav(): void {
    this.navHidden.update((currentValue) => !currentValue);
  }

  async logout(): Promise<void> {
    const token = this.session.token();

    try {
      if (token) {
        await this.api.logout(token);
      }
    } catch {
      // Local logout is enough if the server request fails.
    } finally {
      this.session.clearAuth();
      await this.router.navigate(['/']);
    }
  }

  private async loadDashboard(): Promise<void> {
    const token = this.session.token();

    if (!token) {
      await this.router.navigate(['/login']);
      return;
    }

    try {
      const user = await this.api.getProfile(token);
      this.session.patchUser(user);

      if (!user.onboardingCompleted) {
        await this.router.navigate(['/onboarding']);
        return;
      }
    } catch (error) {
      this.errorMessage.set(
        this.api.getErrorMessage(error, 'We could not load your dashboard right now.'),
      );
      this.session.clearAuth();
      await this.router.navigate(['/login']);
      return;
    } finally {
      this.loading.set(false);
    }
  }

  private metricFromUser(
    user: PublicUser,
    salt: string,
    base: number,
    spread: number,
  ): number {
    const seed = this.seedFromUser(user, salt);
    return base + (seed % spread);
  }

  private seedFromUser(user: PublicUser, salt: string): number {
    const raw = [
      user.id,
      user.mainGoal ?? '',
      user.biggestStruggle ?? '',
      user.whatTheyStudy ?? '',
      user.preferredSessionLength ?? '',
      salt,
    ].join('|');

    return Array.from(raw).reduce(
      (total, character, index) => total + character.charCodeAt(0) * (index + 1),
      0,
    );
  }

  private buildMeetings(user: PublicUser | null): DashboardMeeting[] {
    if (!user) {
      return [];
    }

    const routeTitle = user.recommendedQuest || 'Starter quest planning';
    const struggleLabel = getOptionLabel(user.biggestStruggle);
    const studyLabel = getOptionLabel(user.whatTheyStudy);

    return [
      {
        day: 'Tue, 11 Jul',
        time: '08:15 am',
        title: routeTitle,
        channel: 'Quest room',
      },
      {
        day: 'Tue, 11 Jul',
        time: '09:30 pm',
        title: `${struggleLabel} reset`,
        channel: 'Focus timer',
      },
      {
        day: 'Tue, 12 Jul',
        time: '02:30 pm',
        title: `${studyLabel} review`,
        channel: 'Flashcards',
      },
      {
        day: 'Tue, 15 Jul',
        time: '04:00 pm',
        title: 'Weekly route check-in',
        channel: 'Study log',
      },
    ];
  }

  private buildAreas(user: PublicUser | null): DashboardArea[] {
    if (!user) {
      return [];
    }

    return [
      {
        label: 'Focus skills',
        value: this.metricFromUser(user, 'focus-area', 58, 28),
        direction: user.biggestStruggle === 'focus' ? 'up' : 'down',
      },
      {
        label: 'Active recall',
        value: this.metricFromUser(user, 'recall-area', 64, 24),
        direction: user.mainGoal === 'better-grades' ? 'up' : 'down',
      },
      {
        label: 'Planning',
        value: this.metricFromUser(user, 'planning-area', 38, 30),
        direction: user.biggestStruggle === 'planning' ? 'up' : 'down',
      },
      {
        label: 'Consistency',
        value: this.metricFromUser(user, 'consistency-area', 52, 26),
        direction: user.mainGoal === 'stay-consistent' ? 'up' : 'down',
      },
      {
        label: 'Confidence',
        value: this.metricFromUser(user, 'confidence-area', 46, 34),
        direction: 'up',
      },
    ];
  }

  private buildTrackers(user: PublicUser | null): TrackerConnection[] {
    if (!user) {
      return [];
    }

    return [
      { short: 'FT', label: 'Focus timer' },
      { short: 'AR', label: getOptionLabel(user.mainGoal) },
      { short: 'QT', label: getOptionLabel(user.whatTheyStudy) },
    ];
  }

  private buildToolUnlocks(user: PublicUser | null): ToolUnlock[] {
    if (!user) {
      return [];
    }

    return [
      {
        icon: '◔',
        title: 'Pomodoro timer',
        copy: `Built around ${getOptionLabel(user.preferredSessionLength)} sessions.`,
        tone: 'cyan',
      },
      {
        icon: '✦',
        title: 'Recall cards',
        copy: `Great for improving ${getOptionLabel(user.mainGoal).toLowerCase()}.`,
        tone: 'lime',
      },
      {
        icon: '◎',
        title: 'Progress log',
        copy: `Helps track ${getOptionLabel(user.biggestStruggle).toLowerCase()} over time.`,
        tone: 'magenta',
      },
    ];
  }
}
