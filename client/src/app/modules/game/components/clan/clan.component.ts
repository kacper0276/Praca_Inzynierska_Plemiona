import { Component, OnInit } from '@angular/core';
import { ClansService, ServerService } from '@modules/game/services';
import { Clan } from '@shared/models';

@Component({
  selector: 'app-clan',
  templateUrl: './clan.component.html',
  styleUrl: './clan.component.scss',
})
export class ClanComponent implements OnInit {
  currentClan: Clan | null = null;

  constructor(
    private clansService: ClansService,
    private serverService: ServerService
  ) {}

  ngOnInit(): void {
    this.loadClanData();
  }

  loadClanData(): void {
    const serverId = this.serverService.getServer()?.id ?? -1;
    this.clansService.getCurrentClan(serverId).subscribe({
      next: (res) => (this.currentClan = res.data),
      error: () => (this.currentClan = null),
    });
  }
}
