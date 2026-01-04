import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@modules/auth/services';
import {
  ClansService,
  ResourcesService,
  ServerService,
  UsersService,
} from '@modules/game/services';
import { MultiSelectItem } from '@shared/interfaces';
import { Clan } from '@shared/models';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-clan-view',
  templateUrl: './clan-view.component.html',
  styleUrl: './clan-view.component.scss',
})
export class ClanViewComponent {
  @Input() clan!: Clan;
  @Output() refresh = new EventEmitter<void>();

  tab: 'members' | 'chat' | 'resources' = 'members';
  currentUserId = this.userService.getCurrentUser()?.id;
  msgText = '';
  messages: any[] = [];
  resForm: FormGroup;

  isAddModalOpen: boolean = false;
  userFriends: MultiSelectItem[] = [];
  selectedUsers: MultiSelectItem[] = [];

  constructor(
    private readonly userService: UserService,
    private readonly clansService: ClansService,
    private readonly resSvc: ResourcesService,
    private readonly toastr: ToastrService,
    private readonly fb: FormBuilder,
    private readonly usersService: UsersService,
    private readonly serverService: ServerService
  ) {
    this.resForm = this.fb.group({
      to: [null, Validators.required],
      wood: [0],
      clay: [0],
      iron: [0],
    });
  }

  get isFounder() {
    return this.clan.founder.id === this.currentUserId;
  }

  kick(userId: number) {
    if (this.clan && this.clan.id) {
      this.clansService.kickUserFromClan(this.clan.id, userId).subscribe({
        next: () => {
          this.clan.members = this.clan.members.filter(
            (member) => member.id !== userId
          );
        },
      });
    }
  }

  openAddMemberModal() {
    this.isAddModalOpen = true;
    this.selectedUsers = [];

    const currentServer = this.serverService.getServer();

    if (currentServer && currentServer.id) {
      this.fetchFriendsWithoutClans(currentServer.id);
    }
  }

  addSelectedMembers() {
    if (this.selectedUsers.length === 0) return;

    const idsToAdd = this.selectedUsers.map((selectedUser) => selectedUser.id);

    if (this.clan && this.clan.id) {
      this.clansService.addMembers(this.clan.id, idsToAdd).subscribe({
        next: () => {
          this.refresh.emit();
          this.isAddModalOpen = false;
        },
      });
    }
  }

  onFriendsChange(selected: MultiSelectItem[]): void {
    this.selectedUsers = selected;
  }

  private fetchFriendsWithoutClans(serverId: number): void {
    this.usersService.fetchFriendsWithoutClans(serverId).subscribe({
      next: (res) => {
        this.userFriends = res.data.map((user) => ({
          id: user.id,
          name:
            `${user.firstName} ${user.lastName}` || user.email || user.login,
          avatar: user.profileImage,
        })) as MultiSelectItem[];
      },
    });
  }

  sendMsg() {
    if (!this.msgText.trim()) return;
  }

  sendRes() {
    if (this.resForm.invalid) {
      this.toastr.showWarning('Wybierz odbiorcę i poprawne ilości.');
      return;
    }

    const val = this.resForm.value;
    const amounts = {
      wood: val.wood || 0,
      clay: val.clay || 0,
      iron: val.iron || 0,
    };

    if (amounts.wood + amounts.clay + amounts.iron <= 0) {
      this.toastr.showWarning('Musisz wybrać przynajmniej jeden surowiec.');
      return;
    }

    const currentServer = this.serverService.getServer();
    if (!currentServer || !currentServer.id) {
      this.toastr.showError('Błąd serwera. Odśwież stronę.');
      return;
    }

    this.resSvc
      .sendResourcesToOtherPlayer(+val.to, currentServer.id, amounts)
      .subscribe({
        next: () => {
          this.toastr.showSuccess('Surowce zostały wysłane!');
          this.resForm.reset({ to: null, wood: 0, clay: 0, iron: 0 });
        },
        error: (err) => {
          if (err.status === 400) {
            this.toastr.showError(
              err.error?.message || 'Nie masz wystarczającej ilości surowców.'
            );
          } else {
            this.toastr.showError('Wystąpił błąd podczas transferu.');
          }
        },
      });
  }
}
