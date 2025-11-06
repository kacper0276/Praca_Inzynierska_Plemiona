import { Component, OnInit } from '@angular/core';
import { UserService } from './modules/auth/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'client';

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getUserFromToken().subscribe({
      next: (res) => {
        this.userService.setUser(res.data);
        this.router.navigate([`/game/village/${res.data.email}`]);
      },
    });
  }
}
