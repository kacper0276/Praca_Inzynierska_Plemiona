import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@modules/auth/services';
import { ClansService, ResourcesService } from '@modules/game/services';
import { Clan } from '@shared/models';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-clan-view',
  templateUrl: './clan-view.component.html',
  styleUrl: './clan-view.component.scss',
})
export class ClanViewComponent {
  @Input() clan!: Clan;
  @Output() refresh = new EventEmitter<void>();

  tab: 'members' | 'chat' | 'resources' = 'members';
  currentUserId = this.userService.getCurrentUser()?.id;
  msgText = '';
  messages: any[] = [];
  resForm: FormGroup;

  constructor(
    private userService: UserService,
    private clansService: ClansService,
    private resSvc: ResourcesService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.resForm = this.fb.group({
      to: ['', Validators.required],
      wood: [0],
      clay: [0],
      iron: [0],
    });
  }

  get isFounder() {
    return this.clan.founder.id === this.currentUserId;
  }

  kick(id: number) {}

  sendMsg() {
    if (!this.msgText.trim()) return;
  }

  sendRes() {
    const val = this.resForm.value;
    const cost = { wood: val.wood, clay: val.clay, iron: val.iron };
    if (this.resSvc.spendResources(cost)) {
    }
  }
}
