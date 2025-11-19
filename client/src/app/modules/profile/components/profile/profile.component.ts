import { Component, OnInit } from '@angular/core';
import { User } from '../../../../shared/models';
import { UserRole } from '../../../../shared/enums';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../auth/services/user.service';
import { environment } from '../../../../../environments/environment';

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
    private readonly userService: UserService
  ) {
    this.userEmail = this.activatedRoute.snapshot.params['userEmail'];
  }

  ngOnInit(): void {
    this.userService.getUserByEmail(this.userEmail).subscribe({
      next: (res) => {
        this.user = res.data;

        console.log(res.data);
      },
    });
  }

  get userInitials(): string {
    const { firstName, lastName, login } = this.user;
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    if (firstName) {
      return firstName.substring(0, 2);
    }
    if (login) {
      return login.substring(0, 2);
    }
    return '?';
  }
}
