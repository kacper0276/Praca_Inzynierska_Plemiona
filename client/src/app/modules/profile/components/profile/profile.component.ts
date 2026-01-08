import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { User } from '@shared/models';
import { UserService } from '@modules/auth/services';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user!: User;
  backendUrl: string = environment.serverBaseUrl;

  userEmail: string = '';

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: UserService,
    private readonly translate: TranslateService,
    private readonly toastr: ToastrService
  ) {
    this.userEmail = this.activatedRoute.snapshot.params['userEmail'];
  }

  ngOnInit(): void {
    this.userService.getUserByEmail(this.userEmail).subscribe({
      next: (res) => {
        this.user = res.data;
      },
      error: (err) => {
        this.toastr.showError(
          this.translate.instant('profile.ERRORS.FETCH_USER_FAILED')
        );
      },
    });
  }

  get userInitials(): string {
    if (!this.user) {
      return '?';
    }
    const { firstName, lastName, login } = this.user;
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    if (login) {
      return login.substring(0, 2).toUpperCase();
    }
    return '?';
  }
}
