import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Theme } from '../../../../shared/types/theme.type';
import { ThemeService } from '../../../../shared/services/theme.service';
import { th } from 'date-fns/locale';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent {
  @Input() activeTab: string = 'village';
  isCollapsed = false;
  currentLang = 'pl';
  currentTheme: Theme = 'light';

  constructor(
    private translate: TranslateService,
    private readonly themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const storedLang = localStorage.getItem('lang');
    if (storedLang) {
      this.setLanguage(storedLang);
    } else {
      this.currentLang = this.translate.getDefaultLang() || 'pl';
      this.translate.use(this.currentLang);
    }

    const serviceTheme = this.themeService.theme || 'light';
    this.currentTheme = serviceTheme;
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  setLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  toggleTheme() {
    const next = this.themeService.toggle();
    this.currentTheme = next;
  }

  private applyTheme(theme: Theme) {
    this.themeService.set(theme);
    this.currentTheme = theme;
  }
}
