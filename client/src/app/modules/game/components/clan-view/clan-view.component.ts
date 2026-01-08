import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@modules/auth/services';
import {
  ClansService,
  ResourcesService,
  ServerService,
  UsersService,
} from '@modules/game/services';
import { MessageUi, MultiSelectItem } from '@shared/interfaces';
import { ChatItem, Clan } from '@shared/models';
import {
  ChatGroupsService,
  ToastrService,
  WebSocketService,
} from '@shared/services';
import { finalize, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-clan-view',
  templateUrl: './clan-view.component.html',
  styleUrl: './clan-view.component.scss',
})
export class ClanViewComponent implements OnInit {
  @Input() clan!: Clan;
  @Output() refresh = new EventEmitter<void>();

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  backendUrl: string = environment.serverBaseUrl;

  tab: 'members' | 'chat' | 'resources' = 'members';
  currentUserId = this.userService.getCurrentUser()?.id;
  msgText = '';
  messages: MessageUi[] = [];
  resForm: FormGroup;

  isAddModalOpen: boolean = false;
  userFriends: MultiSelectItem[] = [];
  selectedUsers: MultiSelectItem[] = [];

  selectedChat: ChatItem | null = null;

  private subs: Subscription = new Subscription();

  isLoadingMessages: boolean = false;

  constructor(
    private readonly userService: UserService,
    private readonly clansService: ClansService,
    private readonly resSvc: ResourcesService,
    private readonly toastr: ToastrService,
    private readonly fb: FormBuilder,
    private readonly usersService: UsersService,
    private readonly serverService: ServerService,
    private readonly groupService: ChatGroupsService,
    private readonly wsService: WebSocketService,
    private readonly translate: TranslateService
  ) {
    this.resForm = this.fb.group({
      to: [null, Validators.required],
      wood: [0],
      clay: [0],
      iron: [0],
    });
  }

  ngOnInit(): void {
    this.listenToWebSockets();

    this.fetchChatGroupForClan();
  }

  get isFounder() {
    return this.clan.founder.id === this.currentUserId;
  }

  private fetchChatGroupForClan(): void {
    const server = this.serverService.getServer();

    if (server && server.id) {
      this.groupService
        .getChatByName(`${server.id}-${this.clan.name}`)
        .subscribe({
          next: (res) => {
            this.selectedChat = res.data;

            this.selectChat(res.data);
          },
        });
    }
  }

  selectChat(chat: ChatItem): void {
    if (this.selectedChat?.type === 'group' && this.selectedChat) {
      this.wsService.leaveChatGroup(this.selectedChat.id);
      this.selectedChat = null;
    }

    this.selectedChat = chat;
    this.messages = [];

    this.wsService.joinChatGroup(chat.id);

    this.groupService
      .getGroupMessages(chat.id)
      .pipe(finalize(() => (this.isLoadingMessages = false)))
      .subscribe((res) => {
        this.messages = res.data.map((m) => this.mapToMessageUi(m));
        setTimeout(() => {
          this.scrollToBottom();
        }, 1000);
      });
  }

  private listenToWebSockets(): void {
    this.subs.add(
      this.wsService.onGroupMessage().subscribe((payload: any) => {
        const msg = payload.content;
        const groupId = payload.group.id;

        this.handleIncomingMessage(payload, 'group', undefined, groupId);
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

    chatIdForList = groupId!;
    if (this.selectedChat && this.selectedChat.id === groupId) {
      isCurrentChat = true;
    }

    if (isCurrentChat) {
      this.messages.push(this.mapToMessageUi(rawMsg));
      this.scrollToBottom();
    }
  }

  private mapToMessageUi(backendMsg: any): MessageUi {
    const isMe = backendMsg.sender.id === this.currentUserId;
    return {
      id: backendMsg.id,
      content: backendMsg.content,
      isMe: isMe,
      time: new Date(backendMsg.createdAt).toString(),
      senderName: isMe
        ? this.translate.instant('clan.view.CHAT.SENDER_ME')
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

    const content = this.msgText;

    this.msgText = '';

    this.groupService
      .sendMessage(this.selectedChat?.id ?? -1, content)
      .subscribe({
        next: (res) => {},
        error: () => {
          this.toastr.showError(
            this.translate.instant('clan.view.CHAT.ERROR_SEND')
          );
          this.msgText = content;
        },
      });
  }

  getInitials(name: string): string {
    if (name) {
      return `${name.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  sendRes() {
    if (this.resForm.invalid) {
      this.toastr.showWarning(
        this.translate.instant('clan.view.RESOURCES.WARNINGS.INVALID_FORM')
      );
      return;
    }

    const val = this.resForm.value;
    const amounts = {
      wood: val.wood || 0,
      clay: val.clay || 0,
      iron: val.iron || 0,
    };

    if (amounts.wood + amounts.clay + amounts.iron <= 0) {
      this.toastr.showWarning(
        this.translate.instant('clan.view.RESOURCES.WARNINGS.ZERO_AMOUNT')
      );
      return;
    }

    const currentServer = this.serverService.getServer();
    if (!currentServer || !currentServer.id) {
      this.toastr.showError(
        this.translate.instant('clan.view.RESOURCES.ERRORS.SERVER_ERROR')
      );
      return;
    }

    this.resSvc
      .sendResourcesToOtherPlayer(+val.to, currentServer.id, amounts)
      .subscribe({
        next: () => {
          this.toastr.showSuccess(
            this.translate.instant('clan.view.RESOURCES.SUCCESS')
          );
          this.resForm.reset({ to: null, wood: 0, clay: 0, iron: 0 });
        },
        error: (err) => {
          if (err.status === 400) {
            this.toastr.showError(
              err.error?.message ||
                this.translate.instant('clan.view.RESOURCES.ERRORS.NOT_ENOUGH')
            );
          } else {
            this.toastr.showError(
              this.translate.instant(
                'clan.view.RESOURCES.ERRORS.TRANSFER_FAILED'
              )
            );
          }
        },
      });
  }
}
