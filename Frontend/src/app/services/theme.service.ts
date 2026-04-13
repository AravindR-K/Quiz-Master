import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'blue';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<ThemeMode>('light');

  constructor() {
    const saved = localStorage.getItem('theme') as ThemeMode;
    if (saved && ['light', 'dark', 'blue'].includes(saved)) {
      this.currentTheme.set(saved);
    }
    this.applyTheme(this.currentTheme());

    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme(): void {
    const themes: ThemeMode[] = ['light', 'dark', 'blue'];
    const currentIdx = themes.indexOf(this.currentTheme());
    const nextIdx = (currentIdx + 1) % themes.length;
    this.setTheme(themes[nextIdx]);
  }

  private applyTheme(theme: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
