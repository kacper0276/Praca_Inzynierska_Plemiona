import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Theme } from '../../../../shared/types/theme.type';
import { ThemeService } from '../../../../shared/services/theme.service';
import { UserService } from '../../../auth/services/user.service';
import { User } from '../../../../shared/models';

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
  bugModalOpen = false;
  bug = {
    title: '',
    description: '',
    email: '',
  };
  bugSubmitted = false;
  currentUser: User | null = null;

  constructor(
    private readonly translate: TranslateService,
    private readonly themeService: ThemeService,
    private readonly userService: UserService
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

    this.currentUser = this.userService.getCurrentUser();
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

  openBugReport() {
    this.bugModalOpen = true;
    this.bugSubmitted = false;
    this.bug = { title: '', description: '', email: '' };
  }

  closeBugModal() {
    this.bugModalOpen = false;
  }

  submitBugReport() {
    console.log('Bug report submitted', this.bug);
    this.bugSubmitted = true;
    setTimeout(() => {
      this.bugModalOpen = false;
    }, 1200);
  }

  onBugSubmitted() {
    this.bugSubmitted = true;
  }
}
