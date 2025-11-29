import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { User } from '../../../../shared/models';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  searchQuery: string = '';
  friendSearchQuery: string = '';
  newMessage: string = '';
  newGroupName: string = '';

  isModalOpen: boolean = false;
  isDropdownOpen: boolean = false;

  allChats = [
    {
      id: 1,
      name: 'Anna Nowak',
      avatar: 'https://i.pravatar.cc/150?u=1',
      lastMessage: 'Jasne, do zobaczenia!',
      time: '10:30',
    },
    {
      id: 2,
      name: 'Piotr Kowalski',
      avatar: 'https://i.pravatar.cc/150?u=2',
      lastMessage: 'Możesz wysłać pliki?',
      time: '09:15',
    },
    {
      id: 3,
      name: 'Zespół Projektowy',
      avatar: 'https://i.pravatar.cc/150?u=3',
      lastMessage: 'Marek: Spotkanie o 12:00',
      time: 'Wczoraj',
    },
  ];
  filteredChats: any[] = [];
  selectedChat: any | null = null;

  messages: any[] = [];

  allFriends = [
    { id: 1, name: 'Anna Nowak', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Piotr Kowalski', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Marek Zegarek', avatar: 'https://i.pravatar.cc/150?u=4' },
    {
      id: 4,
      name: 'Kasia Wiśniewska',
      avatar: 'https://i.pravatar.cc/150?u=5',
    },
    { id: 5, name: 'Tomek Boczarski', avatar: 'https://i.pravatar.cc/150?u=6' },
  ];
  filteredFriends: any[] = [];
  selectedFriends: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.filteredChats = this.allChats;
    this.filteredFriends = this.allFriends;
  }

  filterChats(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredChats = this.allChats.filter((chat) =>
      chat.name.toLowerCase().includes(query)
    );
  }

  selectChat(chat: any): void {
    this.selectedChat = chat;
    this.messages = [
      { id: 1, content: 'Hej, jak tam projekt?', isMe: false, time: '10:00' },
      {
        id: 2,
        content: 'Wszystko idzie zgodnie z planem.',
        isMe: true,
        time: '10:05',
      },
      {
        id: 3,
        content: 'Super, daj znać jak skończysz.',
        isMe: false,
        time: '10:06',
      },
    ];
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const msg = {
      id: Date.now(),
      content: this.newMessage,
      isMe: true,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    this.messages.push(msg);
    this.newMessage = '';
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  openGroupModal(): void {
    this.isModalOpen = true;
    this.newGroupName = '';
    this.selectedFriends = [];
    this.friendSearchQuery = '';
    this.filteredFriends = this.allFriends;
  }

  closeGroupModal(): void {
    this.isModalOpen = false;
    this.isDropdownOpen = false;
  }

  onFriendsSelectionChange(selected: any[]): void {
    this.selectedFriends = selected;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  filterFriends(): void {
    const query = this.friendSearchQuery.toLowerCase();
    this.filteredFriends = this.allFriends.filter((friend) =>
      friend.name.toLowerCase().includes(query)
    );
    this.isDropdownOpen = true;
  }

  selectFriend(friend: User): void {
    if (!this.isSelected(friend)) {
      this.selectedFriends.push(friend);
    }
    this.friendSearchQuery = '';
    this.filteredFriends = this.allFriends;
  }

  removeFriend(friend: User, event: Event): void {
    event.stopPropagation();
    this.selectedFriends = this.selectedFriends.filter(
      (f) => f.id !== friend.id
    );
  }

  isSelected(friend: User): boolean {
    return this.selectedFriends.some((f) => f.id === friend.id);
  }

  createGroup(): void {
    const newChat = {
      id: Date.now(),
      name: this.newGroupName,
      avatar: 'https://i.pravatar.cc/150?u=99',
      lastMessage: 'Grupa utworzona',
      time: 'Teraz',
    };

    this.allChats.unshift(newChat);
    this.filterChats();
    this.closeGroupModal();
    this.selectChat(newChat);
  }
}
