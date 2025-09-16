import { Injectable } from '@angular/core';
import { Theme } from '../types/theme.type';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'app_theme';
  private current: Theme = 'light';

  constructor() {
    const saved = localStorage.getItem(this.storageKey) as Theme | null;
    this.current =
      saved ||
      (window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    this.apply(this.current);
  }

  get theme(): Theme {
    return this.current;
  }

  toggle(): Theme {
    this.current = this.current === 'light' ? 'dark' : 'light';
    this.apply(this.current);
    localStorage.setItem(this.storageKey, this.current);
    return this.current;
  }

  set(theme: Theme) {
    this.current = theme;
    this.apply(this.current);
    localStorage.setItem(this.storageKey, this.current);
  }

  private apply(theme: Theme) {
    const root = document.documentElement;
    if (!root) return;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }
}
