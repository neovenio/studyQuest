import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { SessionService } from './core/services/session.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.shell.html',
  styleUrl: './app.shell.scss',
})
export class App {
  private readonly themeService = inject(ThemeService);
  private readonly sessionService = inject(SessionService);

  constructor() {
    this.themeService.initialize(this.sessionService.user()?.themePreference);
  }
}
