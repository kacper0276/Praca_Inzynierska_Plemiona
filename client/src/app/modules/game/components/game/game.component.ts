import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ServerStatus } from '@shared/enums';
import { Server, Resources } from '@shared/models';
import { UserService } from '@modules/auth/services';
import {
  ResourcesService,
  ServersService,
  ServerService,
} from '@modules/game/services';
import { WebSocketService, ToastrService } from '@shared/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit, OnDestroy {
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
    private readonly serverService: ServerService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService
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
    if (!this.resourcesService.spendResources(cost)) {
      this.toastr.showError(
        this.translate.instant('game.errors.BUILD_FARM_FAILED')
      );
    }
  }

  public collectWood(): void {
    this.resourcesService.addResource('wood', 100);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.toastr.showInfo(this.translate.instant('game.info.CANCELLED_MODAL'));
  }

  joinGame(): void {
    if (!this.selectedServerInModal) {
      this.toastr.showWarning(
        this.translate.instant('game.errors.NO_SERVER_SELECTED')
      );
      return;
    }

    this.joinedServer = this.selectedServerInModal;
    this.toastr.showSuccess(
      this.translate.instant('game.success.JOINED_SERVER', {
        serverName: this.joinedServer.name,
      })
    );

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
                  this.toastr.showError(
                    this.translate.instant('game.errors.FETCH_RES_FAILED')
                  );
                },
              });

            this.listenForStatusUpdates();
          },
          error: () => {
            this.connectionFailed = true;
            this.toastr.showError(
              this.translate.instant('game.errors.CONNECTION_FAILED')
            );
          },
        });

      this.errorSubscription = this.webSocket
        .onConnectError()
        .pipe(take(1))
        .subscribe((err) => {
          this.connectionFailed = true;
          this.toastr.showError(
            this.translate.instant('game.errors.CONNECTION_FAILED')
          );
        });
    } catch (e) {
      console.warn('WS connect failed', e);
      this.connectionFailed = true;
      this.toastr.showError(
        this.translate.instant('game.errors.CONNECTION_FAILED')
      );
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
      if (this.errorSubscription) {
        this.errorSubscription.unsubscribe();
      }
    } catch {}
  }
}
