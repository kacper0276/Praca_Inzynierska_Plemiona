import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@modules/auth/services';
import { TranslateService } from '@ngx-translate/core';
import {
  ToastrService,
  ThemeService,
  LocalStorageService,
} from '@shared/services';
import { Theme } from '@shared/types/theme.type';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title: string = 'Terra Bellum';
  isDesktopDevice: boolean = false;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService,
    private readonly deviceService: DeviceDetectorService,
    private readonly themeService: ThemeService,
    private readonly localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.checkDevice();

    this.setTheme();

    this.userService.getUserFromToken().subscribe({
      next: (res) => {
        this.userService.setUser(res.data);
        this.router.navigate([`/game/village/${res.data.email}`]);
      },
      error: (err) => {
        this.toastrService.showInfo(
          this.translateService.instant(err.message),
          1000 * 3
        );
      },
    });
  }

  private setTheme(): void {
    const theme = this.localStorageService.getItem<Theme>('app_theme');

    if (theme) this.themeService.set(theme);
  }

  private checkDevice(): void {
    this.isDesktopDevice = this.deviceService.isDesktop();
  }
}
