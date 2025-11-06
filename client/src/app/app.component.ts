import { Component, OnInit } from '@angular/core';
import { UserService } from './modules/auth/services/user.service';
import { Router } from '@angular/router';
import { ToastrService } from './shared/services/toastr.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Plemiona';

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
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
}
