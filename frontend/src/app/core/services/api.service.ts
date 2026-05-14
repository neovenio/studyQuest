import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  AuthResponse,
  CompleteOnboardingPayload,
  LoginPayload,
  PublicUser,
  SignUpPayload,
  UpdateProfilePayload,
} from '../models/studyquest';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  signUp(payload: SignUpPayload): Promise<AuthResponse> {
    return firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/auth/signup`, payload),
    );
  }

  login(payload: LoginPayload): Promise<AuthResponse> {
    return firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload),
    );
  }

  completeOnboarding(token: string, payload: CompleteOnboardingPayload): Promise<PublicUser> {
    return firstValueFrom(
      this.http.post<PublicUser>(`${this.baseUrl}/users/me/onboarding`, payload, {
        headers: this.authHeaders(token),
      }),
    );
  }

  logout(token: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.baseUrl}/auth/logout`,
        {},
        { headers: this.authHeaders(token) },
      ),
    );
  }

  getProfile(token: string): Promise<PublicUser> {
    return firstValueFrom(
      this.http.get<PublicUser>(`${this.baseUrl}/users/me`, {
        headers: this.authHeaders(token),
      }),
    );
  }

  updateProfile(token: string, payload: UpdateProfilePayload): Promise<PublicUser> {
    return firstValueFrom(
      this.http.patch<PublicUser>(`${this.baseUrl}/users/me`, payload, {
        headers: this.authHeaders(token),
      }),
    );
  }

  getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? fallback;
    }

    return fallback;
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
