import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { WebSocketEvent } from '../enums/websocket-event.enum';

export interface WsMessage<T = any> {
  event: WebSocketEvent | string;
  payload?: T;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: WebSocket | null = null;
  private url = '';
  private incoming$ = new Subject<WsMessage>();
  private connected$ = new BehaviorSubject<boolean>(false);
  private stopReconnect$ = new Subject<void>();

  constructor(private ngZone: NgZone) {}

  connect(url: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.url = url;
    this.createSocket();
  }

  private createSocket() {
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener('open', () => {
      this.ngZone.run(() => this.connected$.next(true));
    });

    this.socket.addEventListener('message', (evt) => {
      this.handleMessage(evt.data);
    });

    this.socket.addEventListener('close', () => {
      this.ngZone.run(() => this.connected$.next(false));
      timer(1000)
        .pipe(takeUntil(this.stopReconnect$))
        .subscribe(() => this.createSocket());
    });

    this.socket.addEventListener('error', (err) => {
      console.error('WebSocket error', err);
      try {
        this.socket?.close();
      } catch {}
    });
  }

  disconnect() {
    this.stopReconnect$.next();
    if (this.socket) {
      try {
        this.socket.close();
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
    const msg: WsMessage<T> = { event, payload };
    const str = JSON.stringify(msg);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(str);
    } else {
      console.warn('WebSocket is not open. Message dropped:', msg);
    }
  }

  private handleMessage(raw: any) {
    let parsed: WsMessage | null = null;
    try {
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
      console.warn('Failed to parse WS message', raw);
      parsed = { event: WebSocketEvent.GENERIC, payload: raw };
    }

    this.ngZone.run(() => this.incoming$.next(parsed as WsMessage));
  }
}
