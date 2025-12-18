import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@modules/auth/services';
import { ResourcesService, UsersService } from '@modules/game/services';
import { TranslateService } from '@ngx-translate/core';
import { CLANS_COST } from '@shared/consts/clans-cost';
import { MultiSelectItem } from '@shared/interfaces';
import { Resources } from '@shared/models';
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

  constructor(
    private readonly fb: FormBuilder,
    private readonly resSvc: ResourcesService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService,
    private readonly usersService: UsersService,
    private readonly userService: UserService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      members: [[]],
    });
  }

  ngOnInit(): void {
    this.fetchFriendsWithoutClans();
  }

  private fetchFriendsWithoutClans(): void {
    this.usersService.fetchFriendsWithoutClans().subscribe({
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

  createClan() {
    if (this.form.invalid) return;
    if (!this.resSvc.spendResources(this.clanCost)) {
      this.toastr.showError(this.translate.instant('NOT_ENOUGH_RES_CLAN'));
      return;
    }

    const payload = {
      name: this.form.get('name')?.value,
      invited: this.form.get('members')?.value || [],
    };

    this.toastr.showSuccess(this.translate.instant('CLAN_CREATED'));
    this.form.reset({ name: '', members: [] });
  }
}
