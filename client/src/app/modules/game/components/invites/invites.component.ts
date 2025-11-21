import { Component } from '@angular/core';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { UsersService } from '../../services/users.service';
import { UserSearchResult } from '../../interfaces/user-search-result.interface';
import { environment } from '../../../../../environments/environment';
import { FriendRequestsService } from '../../services/friend-requests.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrl: './invites.component.scss',
})
export class InvitesComponent {
  backendUrl: string = environment.serverBaseUrl;

  public searchTerm = new Subject<string>();
  public searchResults: UserSearchResult[] = [];
  public sentInvites: Set<string> = new Set();

  private searchSubscription!: Subscription;

  constructor(
    private readonly usersService: UsersService,
    private readonly friendRequestsService: FriendRequestsService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchTerm
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => this.usersService.searchUsers(term))
      )
      .subscribe({
        next: (users) => (this.searchResults = users.data),
        error: (err) => console.error('Błąd podczas wyszukiwania:', err),
      });

    this.friendRequestsService.getSentFriendRequests().subscribe({
      next: (res) => {
        res.data.forEach((fr) => {
          this.sentInvites.add(fr.receiver.email);
        });
      },
    });
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.next(term);
  }

  navigateToUserProfile(email: string): void {
    this.router.navigate(['/game', 'profile', email]);
  }

  sendInvite(userEmail: string): void {
    this.friendRequestsService.sendFriendInviteByEmail(userEmail).subscribe({
      next: () => {
        this.sentInvites.add(userEmail);
      },
      error: (err) => console.error('Błąd podczas wysyłania zaproszenia:', err),
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
