import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-sign-up-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.page.html',
  styleUrl: './sign-up.page.scss',
})
export class SignUpPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly showPasswords = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.errorMessage.set(
        'Please enter a valid email and make sure both password fields have at least 8 characters.',
      );
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.controls.password.value !== this.form.controls.confirmPassword.value) {
      this.errorMessage.set('Your password and confirm password fields do not match yet.');
      this.form.controls.confirmPassword.markAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      const { confirmPassword, ...payload } = this.form.getRawValue();
      void confirmPassword;

      const response = await this.api.signUp(payload);

      this.session.setAuth(response);
      await this.router.navigate(['/onboarding']);
    } catch (error) {
      this.errorMessage.set(
        this.api.getErrorMessage(error, 'We could not create your account right now.'),
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  toggleShowPasswords(): void {
    this.showPasswords.update((currentValue) => !currentValue);
  }
}
