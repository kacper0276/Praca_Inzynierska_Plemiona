import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Resources } from '../../../../shared/models/resources.model';
import { ResourceService } from '../../../../shared/services/resource.service';
import { WebSocketService } from '../../../../shared/services/web-socket.service';
import { WebSocketEvent } from '../../../../shared/enums/websocket-event.enum';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  isModalOpen = true;
  joinedServerId: string | null = null;
  activeTab: string = 'village';

  servers = [
    { id: 's1-alpha', name: 'Świat Alfa' },
    { id: 's2-beta', name: 'Świat Beta' },
    { id: 's3-gamma', name: 'Świat Gamma' },
  ];
  selectedServerInModal: string = this.servers[0].id;

  resources: Resources = {
    wood: 0,
    clay: 0,
    iron: 0,
    population: 0,
    maxPopulation: 0,
  };

  constructor(
    private readonly resourceService: ResourceService,
    private router: Router,
    private webSocket: WebSocketService
  ) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects.split('/').pop();
        this.activeTab = url || 'village';
      });
  }

  ngOnInit(): void {
    this.resourceService.resources$.subscribe((res) => {
      this.resources = res;
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
  }

  ngOnDestroy(): void {
    try {
      this.webSocket.disconnect();
    } catch {}
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
}
