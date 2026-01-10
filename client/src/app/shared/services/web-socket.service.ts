import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { WebSocketEvent } from '../enums';
import { AuthService } from '@modules/auth/services/auth.service';
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
  private authenticated$ = new BehaviorSubject<boolean>(false);
  private connectionError$ = new Subject<any>();

  constructor(
    private ngZone: NgZone,
    private readonly authService: AuthService
  ) {}

  async connect(url: string, serverId?: number) {
    if (this.socket) {
      this.disconnect();
    }

    const token = await this.authService.getValidAccessToken();

    if (!token) {
      console.error('WebSocket connection aborted: No valid token.');
      return;
    }

    this.url = url;

    const options: any = {
      transports: ['websocket'],
      auth: {
        token: `Bearer ${token}`,
      },
      reconnection: false,
    };

    if (serverId) {
      options.query = { serverId: serverId.toString() };
    }

    this.socket = io(this.url, options);

    this.socket.on('connect', () => {
      this.ngZone.run(() => this.connected$.next(true));
    });

    this.socket.on('disconnect', (reason: any) => {
      this.ngZone.run(() => this.connected$.next(false));
    });

    this.socket.on('connect_error', (err: any) => {
      this.ngZone.run(() => {
        console.error('Socket connection error:', err);
        this.connectionError$.next(err);
      });
    });

    this.socket.on(WebSocketEvent.USER_CONNECTED, (payload: any) => {
      this.ngZone.run(() => this.authenticated$.next(true));
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
    this.authenticated$.next(false);
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

  public joinServerStatusRoom(
    hostname: string,
    port: number,
    serverId: number,
    userEmail: string
  ): void {
    const payload = { hostname, port, serverId, userEmail };
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

  public requestVillageData(serverId: number): void {
    this.authenticated$
      .pipe(
        filter((isAuth) => isAuth),
        take(1)
      )
      .subscribe(() => {
        this.send(WebSocketEvent.GET_VILLAGE_DATA, { serverId });
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

  public requestVillageByEmail(email: string): void {
    this.authenticated$
      .pipe(
        filter((isAuth) => isAuth),
        take(1)
      )
      .subscribe(() => {
        this.send(WebSocketEvent.GET_VILLAGE_BY_EMAIL, { email });
      });
  }

  public onVillageByEmailUpdate(): Observable<{ email: string; village: any }> {
    return this.onEvent(WebSocketEvent.VILLAGE_BY_EMAIL_UPDATE).pipe(
      map((message) => message.payload)
    );
  }

  public onVillageByEmailError(): Observable<any> {
    return this.onEvent(WebSocketEvent.VILLAGE_BY_EMAIL_ERROR).pipe(
      map((message) => message.payload)
    );
  }

  public onPendingRequestsCount(): Observable<{ count: number }> {
    return this.onEvent(WebSocketEvent.PENDING_FRIEND_REQUESTS_COUNT).pipe(
      map((message) => message.payload)
    );
  }

  public onFriendRequestReceived(): Observable<any> {
    return this.onEvent(WebSocketEvent.FRIEND_REQUEST_RECEIVED).pipe(
      map((message) => message.payload)
    );
  }

  public on<T>(event: WebSocketEvent | string): Observable<T> {
    return this.onEvent(event).pipe(map((message) => message.payload));
  }

  public onConnectError(): Observable<any> {
    return this.connectionError$.asObservable();
  }

  public sendDirectMessage(receiverId: number, content: string) {
    this.send(WebSocketEvent.DIRECT_MESSAGE_SEND, { receiverId, content });
  }

  public sendGroupMessage(groupId: number, content: string) {
    this.send(WebSocketEvent.GROUP_MESSAGE_SEND, { groupId, content });
  }

  public onDirectMessage(): Observable<any> {
    return this.onEvent(WebSocketEvent.DIRECT_MESSAGE_RECEIVED).pipe(
      map((m) => m.payload)
    );
  }

  public onGroupMessage(): Observable<any> {
    return this.onEvent(WebSocketEvent.GROUP_MESSAGE_RECEIVED).pipe(
      map((m) => m.payload)
    );
  }

  public joinDmRoom(friendId: number): void {
    this.send(WebSocketEvent.JOIN_DM_ROOM, { friendId });
  }

  public leaveDmRoom(friendId: number): void {
    this.send(WebSocketEvent.LEAVE_DM_ROOM, { friendId });
  }

  public joinChatGroup(groupId: number): void {
    this.send(WebSocketEvent.JOIN_GROUP_ROOM, { groupId });
  }

  public leaveChatGroup(groupId: number): void {
    this.send(WebSocketEvent.LEAVE_GROUP_ROOM, { groupId });
  }
}
