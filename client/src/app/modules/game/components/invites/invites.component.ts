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

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrl: './invites.component.scss',
})
export class InvitesComponent {
  public searchTerm = new Subject<string>();
  public searchResults: UserSearchResult[] = [];
  public sentInvites: Set<string> = new Set();

  private searchSubscription!: Subscription;

  constructor(private usersService: UsersService) {}

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
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.next(term);
  }

  sendInvite(userEmail: string): void {
    this.usersService.sendFriendInviteByEmail(userEmail).subscribe({
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
