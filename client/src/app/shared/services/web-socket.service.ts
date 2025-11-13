import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { WebSocketEvent } from '../enums/websocket-event.enum';
import { AuthService } from '../../modules/auth/services/auth.service';
export interface WsMessage<T = any> {
  event: WebSocketEvent | string;
  payload?: T;
}
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: Socket | null = null;
  private url = '';
  private incoming$ = new Subject<WsMessage>();
  private connected$ = new BehaviorSubject<boolean>(false);

  constructor(
    private ngZone: NgZone,
    private readonly authService: AuthService
  ) {}

  async connect(url: string) {
    if (this.socket) {
      this.disconnect();
    }

    const token = await this.authService.getValidAccessToken();

    if (!token) {
      console.error('WebSocket connection aborted: No valid token.');
      return;
    }

    this.url = url;
    this.socket = io(this.url, {
      transports: ['websocket'],
      auth: {
        token: `Bearer ${token}`,
      },
    });

    this.socket.on('connect', () => {
      this.ngZone.run(() => this.connected$.next(true));
    });

    this.socket.on('disconnect', (reason: any) => {
      this.ngZone.run(() => this.connected$.next(false));
    });

    this.socket.onAny((event: string, payload: any) => {
      this.ngZone.run(() => {
        this.incoming$.next({ event, payload });
      });
    });
  }

  disconnect() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch {}
      this.socket = null;
    }
    this.connected$.next(false);
  }

  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  onEvent<T = any>(event?: WebSocketEvent | string): Observable<WsMessage<T>> {
    if (event) {
      return this.incoming$
        .asObservable()
        .pipe(filter((m: WsMessage) => m.event === event));
    }
    return this.incoming$.asObservable();
  }

  send<T = any>(event: WebSocketEvent | string, payload?: T) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected, dropping message', event);
      return;
    }
    this.socket.emit(event as string, payload);
  }

  public joinServerStatusRoom(hostname: string, port: number): void {
    const payload = { hostname, port };
    this.send('joinServerStatusRoom', payload);
  }

  public onServerStatusUpdate(): Observable<any> {
    return this.onEvent('serverStatusUpdate').pipe(
      filter((m) => !!m.payload),
      (source) =>
        new Observable((subscriber) => {
          source.subscribe({
            next: (v) => subscriber.next(v.payload),
            error: (e) => subscriber.error(e),
            complete: () => subscriber.complete(),
          });
        })
    );
  }

  public requestVillageData(): void {
    this.isConnected()
      .pipe(
        filter((isConnected) => isConnected),
        take(1)
      )
      .subscribe(() => {
        console.log('Socket is connected, sending request for village data.');
        this.send(WebSocketEvent.GET_VILLAGE_DATA);
      });
  }

  public onVillageDataUpdate(): Observable<any> {
    return this.onEvent(WebSocketEvent.VILLAGE_DATA_UPDATE).pipe(
      map((message) => message.payload)
    );
  }

  public onVillageDataError(): Observable<any> {
    return this.onEvent(WebSocketEvent.VILLAGE_DATA_ERROR).pipe(
      map((message) => message.payload)
    );
  }
}
