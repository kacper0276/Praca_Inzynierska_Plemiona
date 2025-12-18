import { Component, OnInit } from '@angular/core';
import { UsersService } from '@modules/game/services';
import { ColumnDefinition, ActionEvent } from '@shared/interfaces';
import { User } from '@shared/models';
import { ConfirmationService } from '@shared/services';

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss',
})
export class UserPanelComponent implements OnInit {
  usersList: User[] = [];
  userColumns: ColumnDefinition[] = [
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'login',
      header: 'Login',
    },
    {
      key: 'role',
      header: 'Role',
    },
    {
      key: 'isActive',
      header: 'Aktywne',
    },
  ];
  isModalOpen = false;
  selectedUser: User | null = null;

  constructor(
    private readonly usersService: UsersService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.usersService.fetchAllUsers().subscribe({
      next: (res) => {
        this.usersList = res.data;
      },
    });
  }

  formatUserData(item: User, columnKey: string): any {
    switch (columnKey) {
      case 'isActive':
        return item.isActive ? 'Tak' : 'Nie';
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
      `Czy na pewno chcesz usunąć użytkownika ${userToDelete.email}?`
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
    } else {
      console.log('Usuwanie anulowane.');
    }
  }
}
