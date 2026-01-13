import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'cityshob_theme';

  private readonly isDarkSignal = signal(true);

  readonly isDark = this.isDarkSignal.asReadonly();

  constructor() {
    this.initializeTheme();

    // Apply theme changes reactively
    effect(() => {
      this.applyTheme(this.isDarkSignal() ? 'dark' : 'light');
    });
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme | null;

    if (savedTheme) {
      this.isDarkSignal.set(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkSignal.set(prefersDark);
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only update if no saved preference
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.isDarkSignal.set(e.matches);
      }
    });
  }

  toggleTheme(): void {
    this.isDarkSignal.update(isDark => !isDark);
    this.saveTheme();
  }

  setTheme(theme: Theme): void {
    this.isDarkSignal.set(theme === 'dark');
    this.saveTheme();
  }

  private saveTheme(): void {
    localStorage.setItem(this.THEME_KEY, this.isDarkSignal() ? 'dark' : 'light');
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  }

  getCurrentTheme(): Theme {
    return this.isDarkSignal() ? 'dark' : 'light';
  }
}
