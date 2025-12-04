import { Injectable } from '@angular/core';
import { Server } from '@shared/models';
import { LocalStorageService } from '@shared/services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private readonly SERVER = 'server';

  constructor(private readonly localStorageService: LocalStorageService) {}

  getServer(): Server | null {
    return this.localStorageService.getItem<Server>(this.SERVER);
  }

  setServer(server: Server): void {
    this.localStorageService.setItem(this.SERVER, server);
  }

  clearServer(): void {
    this.localStorageService.removeItem(this.SERVER);
  }
}
