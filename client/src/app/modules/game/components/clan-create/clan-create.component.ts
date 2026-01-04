import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@modules/auth/services';
import {
  ClansService,
  ResourcesService,
  ServerService,
  UsersService,
} from '@modules/game/services';
import { TranslateService } from '@ngx-translate/core';
import { CLANS_COST } from '@shared/consts/clans-cost';
import { MultiSelectItem } from '@shared/interfaces';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-clan-create',
  templateUrl: './clan-create.component.html',
  styleUrls: ['./clan-create.component.scss'],
})
export class ClanCreateComponent implements OnInit {
  @Output() created = new EventEmitter<void>();
  form: FormGroup;
  userFriends: MultiSelectItem[] = [];
  readonly clanCost = CLANS_COST;

  constructor(
    private readonly fb: FormBuilder,
    private readonly clansService: ClansService,
    private readonly usersService: UsersService,
    private readonly serverService: ServerService,
    private readonly userService: UserService,
    private readonly resSvc: ResourcesService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      members: [[]],
    });
  }

  ngOnInit(): void {
    const serverId = this.serverService.getServer()?.id ?? -1;
    this.fetchFriendsWithoutClans(serverId);
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

  onFriendsChange(selected: MultiSelectItem[]): void {
    this.form.patchValue({ members: selected });
  }

  submit(): void {
    if (!this.resSvc.spendResources(this.clanCost)) {
      this.toastr.showError(this.translate.instant('NOT_ENOUGH_RES_CLAN'));
      return;
    }

    const payload = {
      ...this.form.value,
      memberIds: this.form.value.members.map((m: any) => m.id),
      founderId: this.userService.getCurrentUser()?.id,
      serverId: this.serverService.getServer()?.id,
    };

    this.clansService.createClan(payload).subscribe(() => {
      this.created.emit();
    });
  }
}
