import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResourcesService } from '@modules/game/services';
import { TranslateService } from '@ngx-translate/core';
import { Resources } from '@shared/models';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-clan-create',
  templateUrl: './clan-create.component.html',
  styleUrls: ['./clan-create.component.scss'],
})
export class ClanCreateComponent implements OnInit {
  form: FormGroup;
  players = [
    { id: 2, label: 'PlayerA' },
    { id: 3, label: 'PlayerB' },
    { id: 4, label: 'PlayerC' },
    { id: 5, label: 'PlayerD' },
  ];

  readonly clanCost: Partial<Resources> = { wood: 500, clay: 300, iron: 200 };

  constructor(
    private readonly fb: FormBuilder,
    private readonly resSvc: ResourcesService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      members: [[]],
    });
  }

  ngOnInit(): void {}

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
