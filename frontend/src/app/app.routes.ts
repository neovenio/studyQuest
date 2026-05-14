import { Routes } from '@angular/router';
import { WelcomePageComponent } from './pages/welcome/welcome.page';
import { OnboardingPageComponent } from './pages/onboarding/onboarding.page';
import { SignUpPageComponent } from './pages/sign-up/sign-up.page';
import { LoginPageComponent } from './pages/login/login.page';
import { ProfilePageComponent } from './pages/profile/profile.page';
import { DashboardPageComponent } from './pages/dashboard/dashboard.page';

export const routes: Routes = [
  { path: '', component: WelcomePageComponent, title: 'StudyQuest | Welcome' },
  {
    path: 'onboarding',
    component: OnboardingPageComponent,
    title: 'StudyQuest | Onboarding',
  },
  {
    path: 'sign-up',
    component: SignUpPageComponent,
    title: 'StudyQuest | Sign Up',
  },
  { path: 'login', component: LoginPageComponent, title: 'StudyQuest | Login' },
  {
    path: 'dashboard',
    component: DashboardPageComponent,
    title: 'StudyQuest | Dashboard',
  },
  {
    path: 'profile',
    component: ProfilePageComponent,
    title: 'StudyQuest | Profile',
  },
  { path: '**', redirectTo: '' },
];
