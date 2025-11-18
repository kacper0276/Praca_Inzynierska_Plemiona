import { Component, OnInit } from '@angular/core';
import { User } from '../../../../shared/models';
import { UserRole } from '../../../../shared/enums';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: User = {
    email: 'anna.nowak@example.com',
    login: 'annanowak',
    firstName: 'Anna',
    lastName: 'Nowak',
    role: UserRole.USER,
    backgroundImage: 'https://picsum.photos/id/1015/1000/300',
    isActive: true,
    isOnline: true,
    bio: 'Entuzjastka gier RPG i podróży. Odkrywam nowe światy, zarówno w grach, jak i w rzeczywistości. Chętnie dzielę się swoimi doświadczeniami i poznaję nowych ludzi.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  constructor() {}
  ngOnInit(): void {
    console.log('AAAA');
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
