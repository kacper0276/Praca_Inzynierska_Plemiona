import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root',
})
export class FriendRequestNotificationService {
  private pendingRequestsCountSubject = new BehaviorSubject<number>(0);
  public pendingRequestsCount$: Observable<number> =
    this.pendingRequestsCountSubject.asObservable();

  private internalSubscriptions = new Subscription();

  constructor(private webSocketService: WebSocketService) {
    this.webSocketService.isConnected().subscribe((isConnected) => {
      if (isConnected) {
        this.listenForInitialCount();
        this.listenForNewRequests();
      } else {
        this.cleanupAndReset();
      }
    });
  }

  private listenForInitialCount(): void {
    const sub = this.webSocketService
      .onPendingRequestsCount()
      .subscribe(({ count }) => {
        this.pendingRequestsCountSubject.next(count);
      });
    this.internalSubscriptions.add(sub);
  }

  private listenForNewRequests(): void {
    const sub = this.webSocketService
      .onFriendRequestReceived()
      .subscribe(() => {
        const currentCount = this.pendingRequestsCountSubject.getValue();
        this.pendingRequestsCountSubject.next(currentCount + 1);
      });
    this.internalSubscriptions.add(sub);
  }

  public decrementCount(): void {
    const currentCount = this.pendingRequestsCountSubject.getValue();
    if (currentCount > 0) {
      this.pendingRequestsCountSubject.next(currentCount - 1);
    }
  }

  private cleanupAndReset(): void {
    this.internalSubscriptions.unsubscribe();
    this.internalSubscriptions = new Subscription();
    this.pendingRequestsCountSubject.next(0);
  }
}
