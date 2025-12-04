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
import { UserService } from '../../../auth/services/user.service';
import { FriendRequestStatus } from '@shared/enums';
import { FriendRequest } from '@shared/models';
import { FriendRequestNotificationService } from '@shared/services/friend-request-notification.service';

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

  public FriendRequestStatus = FriendRequestStatus;

  invites: FriendRequest[] = [];

  private searchSubscription!: Subscription;

  constructor(
    private readonly usersService: UsersService,
    private readonly friendRequestsService: FriendRequestsService,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly friendRequestNotificationService: FriendRequestNotificationService
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

    this.friendRequestsService.getAllFriendRequests().subscribe({
      next: (res) => {
        res.data.forEach((fr) => {
          if (fr.receiver.email !== this.userService.getCurrentUser()?.email) {
            this.sentInvites.add(fr.receiver.email);
          } else {
            this.sentInvites.add(fr.sender.email);
          }
        });

        this.invites = res.data.filter(
          (fr) =>
            fr.status === FriendRequestStatus.PENDING &&
            fr.receiver.email === this.userService.getCurrentUser()?.email
        );
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

  respondToFriendRequest(inviteId: number, status: FriendRequestStatus): void {
    this.friendRequestsService
      .respondToFriendRequest(inviteId, status)
      .subscribe({
        next: () => {
          this.friendRequestNotificationService.decrementCount();
          this.invites = this.invites.filter(
            (invite) => invite.id !== inviteId
          );
        },
      });
  }

  public userInitials(
    firstName: string,
    lastName: string,
    login: string
  ): string {
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

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
