import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  avatarOptions,
  biggestStruggleOptions,
  getAvatar,
  getOptionLabel,
  mainGoalOptions,
  sessionLengthOptions,
  studyTopicOptions,
  themePreferenceOptions,
  ThemePreference,
} from '../../core/models/studyquest';
import { ApiService } from '../../core/services/api.service';
import { SessionService } from '../../core/services/session.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly themeService = inject(ThemeService);

  readonly avatarOptions = avatarOptions;
  readonly mainGoalOptions = mainGoalOptions;
  readonly biggestStruggleOptions = biggestStruggleOptions;
  readonly studyTopicOptions = studyTopicOptions;
  readonly sessionLengthOptions = sessionLengthOptions;
  readonly themePreferenceOptions = themePreferenceOptions;
  readonly currentUser = this.session.user;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    bio: [''],
    profilePicture: [avatarOptions[0].value, Validators.required],
    themePreference: ['system' as ThemePreference, Validators.required],
    mainGoal: ['', Validators.required],
    biggestStruggle: ['', Validators.required],
    whatTheyStudy: ['', Validators.required],
    preferredSessionLength: ['', Validators.required],
  });

  constructor() {
    void this.loadProfile();
  }

  get selectedAvatar() {
    return getAvatar(this.form.controls.profilePicture.value);
  }

  get optionSummary(): string[] {
    const user = this.currentUser();

    if (!user) {
      return [];
    }

    return [
      getOptionLabel(user.mainGoal),
      getOptionLabel(user.biggestStruggle),
      getOptionLabel(user.whatTheyStudy),
      getOptionLabel(user.preferredSessionLength),
    ];
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const token = this.session.token();

    if (!token) {
      await this.router.navigate(['/login']);
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const updatedUser = await this.api.updateProfile(token, this.form.getRawValue());
      this.session.patchUser(updatedUser);
      this.successMessage.set('Profile saved. Your StudyQuest setup is up to date.');
    } catch (error) {
      this.errorMessage.set(
        this.api.getErrorMessage(error, 'We could not save your profile right now.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  async logout(): Promise<void> {
    const token = this.session.token();

    try {
      if (token) {
        await this.api.logout(token);
      }
    } catch {
      // Logging out locally is enough for this prototype.
    } finally {
      this.session.clearAuth();
      await this.router.navigate(['/']);
    }
  }

  private async loadProfile(): Promise<void> {
    const token = this.session.token();

    if (!token) {
      await this.router.navigate(['/login']);
      return;
    }

    try {
      const user = await this.api.getProfile(token);
      this.session.patchUser(user);
      this.form.patchValue({
        name: user.name,
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
        themePreference: user.themePreference,
        mainGoal: user.mainGoal ?? '',
        biggestStruggle: user.biggestStruggle ?? '',
        whatTheyStudy: user.whatTheyStudy ?? '',
        preferredSessionLength: user.preferredSessionLength ?? '',
      });
      this.themeService.previewPreference(user.themePreference);
    } catch (error) {
      this.session.clearAuth();
      this.errorMessage.set(
        this.api.getErrorMessage(error, 'Your session expired, so please log in again.'),
      );
      await this.router.navigate(['/login']);
    } finally {
      this.loading.set(false);
    }
  }

  previewThemePreference(): void {
    this.themeService.previewPreference(this.form.controls.themePreference.value);
  }
}
