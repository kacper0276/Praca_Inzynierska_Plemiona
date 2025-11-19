import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Theme } from '../../../../shared/types/theme.type';
import { ThemeService } from '../../../../shared/services/theme.service';
import { UserService } from '../../../auth/services/user.service';
import { User } from '../../../../shared/models';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit, OnDestroy {
  @Input() activeTab: string = 'village';
  isCollapsed: boolean = false;
  currentLang: string = 'pl';
  currentTheme: Theme = 'light';
  bugModalOpen: boolean = false;
  bugSubmitted: boolean = false;
  currentUser: User | null = null;
  userMenuOpen: boolean = false;
  backendUrl: string = environment.serverBaseUrl;

  userSub: Subscription | null = null;

  constructor(
    private readonly translate: TranslateService,
    private readonly themeService: ThemeService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly router: Router
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

    this.userSub = this.userService.currentUser$.subscribe({
      next: (res) => {
        this.currentUser = res;
      },
    });
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
  }

  closeBugModal() {
    this.bugModalOpen = false;
  }

  onBugSubmitted() {
    this.bugSubmitted = true;
  }

  toggleUserMenu() {
    if (!this.isCollapsed) {
      this.userMenuOpen = !this.userMenuOpen;
    }
  }

  getInitials(): string {
    if (this.currentUser) {
      const firstName = this.currentUser.firstName || '';
      const lastName = this.currentUser.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
}
