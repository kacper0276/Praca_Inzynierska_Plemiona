import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { ResourcesService } from '../../services/resources.service';
import { UserService } from '../../../auth/services/user.service';
import { ServersService } from '../../services/servers.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ServerStatus } from '@shared/enums';
import { Server, Resources } from '@shared/models';
import { WebSocketService } from '@shared/services/web-socket.service';
import { ServerService } from '@modules/game/services/server.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  isModalOpen = true;
  joinedServer: Server | null = null;
  activeTab: string = 'village';

  servers: Server[] = [];
  selectedServerInModal: Server = this.servers[0];
  connectionFailed: boolean = false;

  private statusSubscription: Subscription | null = null;
  private connectionSubscription: Subscription | null = null;
  private resourcesSubscription: Subscription | null = null;
  private errorSubscription: Subscription | null = null;

  private backendWsUrl = environment.wsUrl;

  resources: Resources = {
    wood: 0,
    clay: 0,
    iron: 0,
    population: 0,
    maxPopulation: 0,
  };

  constructor(
    private readonly resourcesService: ResourcesService,
    public readonly router: Router,
    private readonly webSocket: WebSocketService,
    private readonly usersService: UserService,
    private readonly serversService: ServersService,
    private readonly serverService: ServerService
  ) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects.split('/').pop();
        this.activeTab = url || 'village';
      });
  }

  ngOnInit(): void {
    this.serversService.getAll().subscribe({
      next: (res) => {
        this.servers = res.data;
        this.selectedServerInModal = res.data[0];
      },
    });

    this.resourcesSubscription = this.resourcesService.resources$.subscribe({
      next: (res) => {
        this.resources = res;
      },
    });
  }

  public buildFarm(): void {
    const cost = { wood: 75, clay: 50, iron: 20, population: 5 };
    if (this.resourcesService.spendResources(cost)) {
    } else {
      console.log('Nie udało się zbudować farmy - za mało surowców.');
    }
  }

  public collectWood(): void {
    this.resourcesService.addResource('wood', 100);
  }

  closeModal(): void {
    this.isModalOpen = false;
    console.log('Modal został zamknięty bez wyboru serwera.');
  }

  joinGame(): void {
    if (!this.selectedServerInModal) {
      console.error('Nie wybrano serwera.');
      return;
    }

    this.joinedServer = this.selectedServerInModal;
    console.log(`Dołączono do serwera: ${this.joinedServer.name}`);

    try {
      let wsURL = '';

      wsURL = this.joinedServer
        ? `http://${this.joinedServer.hostname}:${this.joinedServer.port}`
        : this.backendWsUrl;

      this.webSocket.connect(wsURL);

      if (this.connectionSubscription)
        this.connectionSubscription.unsubscribe();

      if (this.errorSubscription) this.errorSubscription.unsubscribe();

      this.connectionSubscription = this.webSocket
        .isConnected()
        .pipe(
          filter((connected) => connected),
          take(1)
        )
        .subscribe({
          next: () => {
            console.log(
              'Połączenie WebSocket nawiązane. Dołączanie do pokoju statusu serwera...'
            );
            const userEmail = this.usersService.getCurrentUser()?.email;

            this.isModalOpen = false;

            this.webSocket.joinServerStatusRoom(
              this.joinedServer!.hostname,
              this.joinedServer!.port,
              this.joinedServer!.id ?? -1,
              userEmail ?? ''
            );

            this.serverService.setServer(this.selectedServerInModal);

            const serverId = this.serverService.getServer()?.id;

            this.resourcesService
              .fetchResources(userEmail ?? '', serverId ?? -1)
              .subscribe({
                next: (res) => {
                  this.resourcesService.setResources(res.data);
                  this.resources = res.data;
                },
                error: () => {
                  this.connectionFailed = true;
                  console.log('AAA');
                },
              });

            this.listenForStatusUpdates();
          },
          error: () => {
            this.connectionFailed = true;
            console.log('AAA');
          },
        });

      this.errorSubscription = this.webSocket
        .onConnectError()
        .pipe(take(1))
        .subscribe((err) => {
          this.connectionFailed = true;
        });
    } catch (e) {
      console.warn('WS connect failed', e);
      this.connectionFailed = true;
    }
  }

  private listenForStatusUpdates(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }

    this.statusSubscription = this.webSocket.onServerStatusUpdate().subscribe({
      next: (update: {
        hostname: string;
        port: number;
        status: string;
        lastChecked: Date;
      }) => {
        console.log('Otrzymano aktualizację statusu:', update);

        const serverToUpdate = this.servers.find(
          (s) => s.hostname === update.hostname && s.port === update.port
        );
        if (serverToUpdate) {
          serverToUpdate.status = update.status as ServerStatus;
          serverToUpdate.lastChecked = update.lastChecked;
        }
      },
    });
  }

  ngOnDestroy(): void {
    try {
      this.webSocket.disconnect();
      if (this.statusSubscription) {
        this.statusSubscription.unsubscribe();
      }
      if (this.connectionSubscription) {
        this.connectionSubscription.unsubscribe();
      }
      if (this.resourcesSubscription) {
        this.resourcesSubscription.unsubscribe();
      }
    } catch {}
  }
}
