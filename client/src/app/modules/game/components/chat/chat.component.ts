import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '@modules/auth/services/auth.service';
import { ChatGroupsService } from '@shared/services/chat-groups.service';
import { ChatItem, User } from '@shared/models';
import { MessageUi } from '@shared/interfaces/message-ui.interface';
import { ChatService } from '@modules/game/services/chat.service';
import { DirectMessagesService } from '@shared/services/direct-message.service';
import { WebSocketService } from '@shared/services/web-socket.service';
import { UserService } from '@modules/auth/services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  searchQuery: string = '';
  friendSearchQuery: string = '';
  newMessage: string = '';

  isModalOpen: boolean = false;
  newGroupName: string = '';

  isDropdownOpen: boolean = false;
  allFriends: User[] = [];
  filteredFriends: User[] = [];
  selectedFriends: User[] = [];

  currentUserId: number = 0;
  allChats: ChatItem[] = [];
  filteredChats: ChatItem[] = [];
  selectedChat: ChatItem | null = null;
  messages: MessageUi[] = [];

  isLoadingMessages: boolean = false;
  private subs: Subscription = new Subscription();

  private activeDmFriendId: number | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly wsService: WebSocketService,
    private readonly chatService: ChatService,
    private readonly groupService: ChatGroupsService,
    private readonly dmService: DirectMessagesService,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    this.currentUserId = user ? user?.id ?? -1 : 0;

    this.fetchChatList();

    this.listenToWebSockets();
  }

  fetchChatList(): void {
    this.chatService.fetchChatsForUser().subscribe({
      next: (response) => {
        this.allChats = response.data.map((c) => ({
          ...c,
          lastMessageDate: new Date(c.lastMessageDate),
        }));
        this.filterChats();
      },
      error: (err) => console.error('Błąd pobierania czatów', err),
    });
  }

  filterChats(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredChats = this.allChats.filter((chat) =>
      chat.name.toLowerCase().includes(query)
    );
  }

  selectChat(chat: ChatItem): void {
    if (
      this.selectedChat?.id === chat.id &&
      this.selectedChat?.type === chat.type
    ) {
      return;
    }

    if (this.selectedChat?.type === 'dm' && this.activeDmFriendId) {
      this.wsService.leaveDmRoom(this.activeDmFriendId);
      this.activeDmFriendId = null;
    }

    this.selectedChat = chat;
    this.messages = [];
    this.isLoadingMessages = true;

    if (chat.type === 'dm') {
      this.wsService.joinDmRoom(chat.id);
      this.activeDmFriendId = chat.id;

      this.dmService
        .getConversation(chat.id)
        .pipe(finalize(() => (this.isLoadingMessages = false)))
        .subscribe((res) => {
          this.messages = res.data.map((m) => this.mapToMessageUi(m));
          this.scrollToBottom();
        });
    } else {
      this.groupService
        .getGroupMessages(chat.id)
        .pipe(finalize(() => (this.isLoadingMessages = false)))
        .subscribe((res) => {
          this.messages = res.data.map((m) => this.mapToMessageUi(m));
          this.scrollToBottom();
        });
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChat) return;

    const content = this.newMessage;
    this.newMessage = '';

    if (this.selectedChat.type === 'dm') {
      this.dmService
        .sendDirectMessage(this.selectedChat.id, content)
        .subscribe({
          next: (res) => {},
          error: () => {
            alert('Błąd wysyłania wiadomości');
            this.newMessage = content;
          },
        });
    } else {
      this.groupService.sendMessage(this.selectedChat.id, content).subscribe({
        next: (res) => {},
        error: () => {
          alert('Błąd wysyłania wiadomości do grupy');
          this.newMessage = content;
        },
      });
    }
  }

  private listenToWebSockets(): void {
    this.subs.add(
      this.wsService.onDirectMessage().subscribe((payload: any) => {
        const msg = payload.content;
        const senderId = payload.sender.id;

        console.log(senderId);
        console.log(msg);

        console.log(payload);

        this.handleIncomingMessage(payload, 'dm', senderId);
      })
    );

    this.subs.add(
      this.wsService.onGroupMessage().subscribe((payload: any) => {
        const msg = payload.message;
        const groupId = payload.groupId;

        console.log(payload);

        this.handleIncomingMessage(msg, 'group', undefined, groupId);
      })
    );
  }

  private handleIncomingMessage(
    rawMsg: any,
    type: 'dm' | 'group',
    senderId?: number,
    groupId?: number
  ): void {
    let isCurrentChat = false;
    let chatIdForList = 0;

    if (type === 'dm') {
      const otherPersonId =
        rawMsg.sender.id === this.currentUserId
          ? rawMsg.receiver.id
          : rawMsg.sender.id;
      chatIdForList = otherPersonId;

      if (
        this.selectedChat?.type === 'dm' &&
        this.selectedChat.id === chatIdForList
      ) {
        isCurrentChat = true;
      }
    } else {
      chatIdForList = groupId!;
      if (
        this.selectedChat?.type === 'group' &&
        this.selectedChat.id === groupId
      ) {
        isCurrentChat = true;
      }
    }

    if (isCurrentChat) {
      this.messages.push(this.mapToMessageUi(rawMsg));
      this.scrollToBottom();
    }

    this.updateChatList(chatIdForList, type, rawMsg.content);
  }

  private updateChatList(
    chatId: number,
    type: 'dm' | 'group',
    content: string
  ): void {
    const index = this.allChats.findIndex(
      (c) => c.id === chatId && c.type === type
    );

    if (index !== -1) {
      const chat = this.allChats[index];
      chat.lastMessage = content;
      chat.lastMessageDate = new Date();

      this.allChats.splice(index, 1);
      this.allChats.unshift(chat);
      this.filterChats();
    } else {
      this.fetchChatList();
    }
  }

  private mapToMessageUi(backendMsg: any): MessageUi {
    const isMe = backendMsg.sender.id === this.currentUserId;
    return {
      id: backendMsg.id,
      content: backendMsg.content,
      isMe: isMe,
      time: new Date(backendMsg.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      senderName: isMe
        ? 'Ja'
        : backendMsg.sender.username || backendMsg.sender.email,
      senderAvatar: backendMsg.sender.avatar || 'assets/default-avatar.png',
    };
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
  }

  closeGroupModal(): void {
    this.isModalOpen = false;
    this.isDropdownOpen = false;
  }

  onFriendsSelectionChange(selected: User[]): void {
    this.selectedFriends = selected;
  }

  createGroup(): void {
    if (!this.newGroupName || this.selectedFriends.length === 0) return;

    const memberIds = this.selectedFriends.map((f) => f.id as number);
    memberIds.push(this.currentUserId);

    this.groupService
      .createGroup({
        name: this.newGroupName,
        memberIds: memberIds,
        description: 'Grupa utworzona przez użytkownika',
      })
      .subscribe({
        next: (res) => {
          this.closeGroupModal();
          this.fetchChatList();
        },
        error: (err) => alert('Nie udało się utworzyć grupy'),
      });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  filterFriends(): void {}

  selectFriend(friend: User): void {
    if (!this.selectedFriends.find((f) => f.id === friend.id)) {
      this.selectedFriends.push(friend);
    }
  }

  removeFriend(friend: User, event: Event): void {
    event.stopPropagation();
    this.selectedFriends = this.selectedFriends.filter(
      (f) => f.id !== friend.id
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();

    if (this.activeDmFriendId) {
      this.wsService.leaveDmRoom(this.activeDmFriendId);
    }
  }
}
