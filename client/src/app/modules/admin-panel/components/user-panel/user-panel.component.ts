import { Component, OnInit } from '@angular/core';
import { UsersService } from '@modules/game/services';
import { ColumnDefinition, ActionEvent } from '@shared/interfaces';
import { User } from '@shared/models';
import { ConfirmationService } from '@shared/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss',
})
export class UserPanelComponent implements OnInit {
  usersList: User[] = [];
  userColumns: ColumnDefinition[] = [];
  isModalOpen: boolean = false;
  isCreateModalOpen: boolean = false;
  selectedUser: User | null = null;

  constructor(
    private readonly usersService: UsersService,
    private readonly confirmationService: ConfirmationService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initColumns();
    this.usersService.fetchAllUsers().subscribe({
      next: (res) => {
        this.usersList = res.data;
      },
    });
  }

  private initColumns(): void {
    this.userColumns = [
      {
        key: 'email',
        header: this.translate.instant('admin.users.EMAIL'),
      },
      {
        key: 'login',
        header: this.translate.instant('admin.users.LOGIN'),
      },
      {
        key: 'role',
        header: this.translate.instant('admin.users.ROLE'),
        type: 'select',
        options: [
          {
            label: this.translate.instant('admin.users.ROLE_ADMIN'),
            value: 'admin',
          },
          {
            label: this.translate.instant('admin.users.ROLE_USER'),
            value: 'user',
          },
        ],
      },
      {
        key: 'isActive',
        header: this.translate.instant('admin.users.IS_ACTIVE'),
        type: 'checkbox',
      },
    ];
  }

  formatUserData(item: User, columnKey: string): any {
    switch (columnKey) {
      case 'isActive':
        return item.isActive
          ? this.translate.instant('admin.users.YES')
          : this.translate.instant('admin.users.NO');
      default:
        return (item as any)[columnKey];
    }
  }

  handleUserAction(event: ActionEvent): void {
    this.selectedUser = event.item as User;
    this.isModalOpen = true;
  }

  closeEditModal(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  onAddUser(newUser: User): void {
    console.log(newUser);
  }

  onSaveUser(updatedUser: User): void {
    if (this.selectedUser !== null) {
      this.usersService
        .updateUser(this.selectedUser.email, updatedUser)
        .subscribe({
          next: () => {
            const index = this.usersList.findIndex(
              (u) => u.email === this.selectedUser?.email
            );
            if (index > -1) {
              this.usersList[index] = updatedUser;
            }
          },
          error: () => {
            this.closeEditModal();
          },
          complete: () => {
            this.closeEditModal();
          },
        });
    }
  }

  async onDeleteUser(userToDelete: User): Promise<void> {
    const result = await this.confirmationService.confirm(
      this.translate.instant('admin.users.DELETE_CONFIRM', {
        email: userToDelete.email,
      })
    );

    if (result) {
      this.usersService.deleteUser(userToDelete.id ?? -1).subscribe({
        next: () => {
          this.usersList = this.usersList.filter(
            (u) => u.email !== userToDelete.email
          );
        },
      });
      this.closeEditModal();
    }
  }
}
