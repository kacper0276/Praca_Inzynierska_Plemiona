import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../../game/services/users.service';
import { User } from '@shared/models';
import { ActionEvent } from '@shared/interfaces/action-event.interface';
import { ColumnDefinition } from '@shared/interfaces/column-definition.interface';
import { ConfirmationService } from '@shared/services/confirmation.service';

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
    console.log('Zapisywanie zmian:', updatedUser);
    const index = this.usersList.findIndex(
      (u) => u.email === updatedUser.email
    );
    if (index > -1) {
      this.usersList[index] = updatedUser;
    }
    this.closeEditModal();
  }

  async onDeleteUser(userToDelete: User): Promise<void> {
    const result = await this.confirmationService.confirm(
      `Czy na pewno chcesz usunąć użytkownika ${userToDelete.email}?`
    );

    if (result) {
      console.log('Usuwanie potwierdzone:', userToDelete);
      this.usersList = this.usersList.filter(
        (u) => u.email !== userToDelete.email
      );
      this.closeEditModal();
    } else {
      console.log('Usuwanie anulowane.');
    }
  }
}
