import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { WebSocketEvent } from '../enums/websocket-event.enum';

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

  constructor(private ngZone: NgZone) {}

  connect(url: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.url = url;
    this.socket = io(this.url, { transports: ['websocket'] });

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
}
