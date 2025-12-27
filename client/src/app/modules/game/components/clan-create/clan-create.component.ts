import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@modules/auth/services';
import { CreateClan } from '@modules/game/interfaces';
import {
  ClansService,
  ResourcesService,
  ServerService,
  UsersService,
} from '@modules/game/services';
import { TranslateService } from '@ngx-translate/core';
import { CLANS_COST } from '@shared/consts/clans-cost';
import { MultiSelectItem } from '@shared/interfaces';
import { Clan, Resources } from '@shared/models';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-clan-create',
  templateUrl: './clan-create.component.html',
  styleUrls: ['./clan-create.component.scss'],
})
export class ClanCreateComponent implements OnInit {
  form: FormGroup;
  userFriends: MultiSelectItem[] = [];

  readonly clanCost: Partial<Resources> = CLANS_COST;

  currentClan: Clan | null = null;

  currentView: 'create' | 'manage' = 'create';

  constructor(
    private readonly fb: FormBuilder,
    private readonly resSvc: ResourcesService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService,
    private readonly usersService: UsersService,
    private readonly userService: UserService,
    private readonly serverService: ServerService,
    private readonly clansService: ClansService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      members: [[]],
    });
  }

  ngOnInit(): void {
    const serverId = this.serverService.getServer()?.id ?? -1;

    this.fetchCurrentClan(serverId);
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

  private fetchCurrentClan(serverId: number): void {
    this.clansService.getCurrentClan(serverId).subscribe({
      next: (res) => {
        this.currentClan = res.data;
        console.log(res.data);

        this.currentView = res.data !== null ? 'manage' : 'create';
      },
      error: () => {
        this.currentView = 'create';
      },
    });
  }

  onFriendsSelectionChange(selected: MultiSelectItem[]): void {
    this.form.patchValue({
      members: selected,
    });
  }

  createClan() {
    if (this.form.invalid) return;
    if (!this.resSvc.spendResources(this.clanCost)) {
      this.toastr.showError(this.translate.instant('NOT_ENOUGH_RES_CLAN'));
      return;
    }

    const memberIds = this.form.value.members.map(
      (member: MultiSelectItem) => member.id
    );

    const founderId = this.userService.getCurrentUser()?.id;

    const serverId = this.serverService.getServer()?.id;

    const payload: CreateClan = {
      name: this.form.get('name')?.value,
      description: this.form.get('description')?.value,
      memberIds: memberIds || [],
      founderId,
      serverId,
    };

    this.clansService.createClan(payload).subscribe({
      next: (res) => {
        console.log(res);
        this.form.reset();
      },
      error: () => {
        this.toastr.showError(this.translate.instant('CLAN_CREATE_ERROR'));
      },
    });
  }
}
