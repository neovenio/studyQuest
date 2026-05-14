import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  biggestStruggleOptions,
  type ChoiceOption,
  getDisplayName,
  mainGoalOptions,
  sessionLengthOptions,
  studyTopicOptions,
} from '../../core/models/studyquest';
import { ApiService } from '../../core/services/api.service';
import { SessionService } from '../../core/services/session.service';

type OnboardingField =
  | 'mainGoal'
  | 'biggestStruggle'
  | 'whatTheyStudy'
  | 'preferredSessionLength';

interface OnboardingStep {
  field: OnboardingField;
  question: string;
  options: ChoiceOption[];
}

@Component({
  selector: 'app-onboarding-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './onboarding.page.html',
  styleUrl: './onboarding.page.scss',
})
export class OnboardingPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  readonly mainGoalOptions = mainGoalOptions;
  readonly biggestStruggleOptions = biggestStruggleOptions;
  readonly studyTopicOptions = studyTopicOptions;
  readonly sessionLengthOptions = sessionLengthOptions;
  readonly currentUser = this.session.user;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly currentStepIndex = signal(0);

  readonly form = this.formBuilder.nonNullable.group({
    mainGoal: ['', Validators.required],
    biggestStruggle: ['', Validators.required],
    whatTheyStudy: ['', Validators.required],
    preferredSessionLength: ['', Validators.required],
  });

  readonly steps: OnboardingStep[] = [
    {
      field: 'mainGoal',
      question: 'What is your main goal?',
      options: this.mainGoalOptions,
    },
    {
      field: 'biggestStruggle',
      question: 'What do you struggle with most?',
      options: this.biggestStruggleOptions,
    },
    {
      field: 'whatTheyStudy',
      question: 'What are you studying right now?',
      options: this.studyTopicOptions,
    },
    {
      field: 'preferredSessionLength',
      question: 'What study session length feels best for you?',
      options: this.sessionLengthOptions,
    },
  ];

  constructor() {
    const currentUser = this.currentUser();

    if (!this.session.token()) {
      void this.router.navigate(['/sign-up']);
      return;
    }

    if (currentUser?.onboardingCompleted) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    if (currentUser) {
      this.form.patchValue({
        mainGoal: currentUser.mainGoal ?? '',
        biggestStruggle: currentUser.biggestStruggle ?? '',
        whatTheyStudy: currentUser.whatTheyStudy ?? '',
        preferredSessionLength: currentUser.preferredSessionLength ?? '',
      });
    }

    const firstIncompleteIndex = this.steps.findIndex((step) => !this.form.controls[step.field].value);

    if (firstIncompleteIndex > 0) {
      this.currentStepIndex.set(firstIncompleteIndex);
    }
  }

  get learnerName(): string {
    const currentUser = this.currentUser();

    if (!currentUser) {
      return 'learner';
    }

    return getDisplayName(currentUser);
  }

  currentStep(): OnboardingStep {
    return this.steps[this.currentStepIndex()];
  }

  isLastStep(): boolean {
    return this.currentStepIndex() === this.steps.length - 1;
  }

  isSelected(value: string): boolean {
    const field = this.currentStep().field;
    return this.form.controls[field].value === value;
  }

  selectOption(value: string): void {
    const field = this.currentStep().field;
    this.form.controls[field].setValue(value);
    this.form.controls[field].markAsTouched();
    this.errorMessage.set('');
  }

  async goPrevious(): Promise<void> {
    this.errorMessage.set('');

    if (this.currentStepIndex() === 0) {
      await this.router.navigate(['/sign-up']);
      return;
    }

    this.currentStepIndex.update((currentValue) => currentValue - 1);
  }

  async goNext(): Promise<void> {
    const field = this.currentStep().field;
    const control = this.form.controls[field];

    if (!control.value) {
      control.markAsTouched();
      this.errorMessage.set('Choose one answer to keep going.');
      return;
    }

    this.errorMessage.set('');

    if (!this.isLastStep()) {
      this.currentStepIndex.update((currentValue) => currentValue + 1);
      return;
    }

    await this.finishOnboarding();
  }

  async finishOnboarding(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Please answer every question before opening your dashboard.');
      return;
    }

    const token = this.session.token();

    if (!token) {
      await this.router.navigate(['/sign-up']);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      const updatedUser = await this.api.completeOnboarding(token, this.form.getRawValue());
      this.session.patchUser(updatedUser);
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage.set(
        this.api.getErrorMessage(error, 'We could not save your onboarding right now.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
