import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Resources } from '../../../../shared/models/resources.model';
import { ResourceService } from '../../services/resource.service';
import { WebSocketService } from '../../../../shared/services/web-socket.service';
import { WebSocketEvent } from '../../../../shared/enums/websocket-event.enum';
import { UserService } from '../../../auth/services/user.service';
import { Server } from '../../../../shared/models';
import { ServersService } from '../../services/servers.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  isModalOpen = true;
  joinedServerId: Server | null = null;
  activeTab: string = 'village';

  servers: Server[] = [];
  selectedServerInModal: Server = this.servers[0];

  resources: Resources = {
    wood: 0,
    clay: 0,
    iron: 0,
    population: 0,
    maxPopulation: 0,
  };

  constructor(
    private readonly resourceService: ResourceService,
    private readonly router: Router,
    private readonly webSocket: WebSocketService,
    private readonly usersService: UserService,
    private readonly serversService: ServersService
  ) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects.split('/').pop();
        this.activeTab = url || 'village';
      });
  }

  ngOnInit(): void {
    const userEmail = this.usersService.getCurrentUser()?.email;
    this.resourceService.fetchResources(userEmail ?? '').subscribe({
      next: (res) => {
        this.resourceService.setResources(res.data);
        this.resources = res.data;
      },
    });

    try {
      const origin = window.location.origin;
      this.webSocket.connect(origin);
      this.webSocket
        .onEvent(WebSocketEvent.ARMY_UPDATE)
        .subscribe((m) => console.log('Army update', m));
    } catch (e) {
      console.warn('WS connect failed', e);
    }

    this.serversService.getAll().subscribe({
      next: (res) => {
        this.servers = res.data;
        this.selectedServerInModal = res.data[0];
      },
    });
  }

  public buildFarm(): void {
    const cost = { wood: 75, clay: 50, iron: 20, population: 5 };
    if (this.resourceService.spendResources(cost)) {
    } else {
      console.log('Nie udało się zbudować farmy - za mało surowców.');
    }
  }

  public collectWood(): void {
    this.resourceService.addResource('wood', 100);
  }

  closeModal(): void {
    this.isModalOpen = false;
    console.log('Modal został zamknięty bez wyboru serwera.');
  }

  joinGame(): void {
    if (this.selectedServerInModal) {
      this.joinedServerId = this.selectedServerInModal;
      this.isModalOpen = false;
      console.log(`Dołączono do serwera: ${this.joinedServerId}`);
    }
  }

  ngOnDestroy(): void {
    try {
      this.webSocket.disconnect();
    } catch {}
  }
}
