import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { WebSocketService } from '../../../shared/services/web-socket.service';
import { WebSocketEvent } from '../../../shared/enums/websocket-event.enum';

@Injectable({ providedIn: 'root' })
export class GatheringService implements OnDestroy {
  private countdownSub: Subscription | null = null;
  private tickIntervalMs = 10000;

  private timeLeftSubject = new BehaviorSubject<number>(0);
  public timeLeft$ = this.timeLeftSubject.asObservable();

  constructor(private readonly webSocketService: WebSocketService) {
    this.webSocketService
      .onEvent(WebSocketEvent.RESOURCE_UPDATE)
      .subscribe(() => {
        this.restartCountdown();
      });
  }

  public start(tickIntervalMs: number): void {
    this.tickIntervalMs = tickIntervalMs;
    this.restartCountdown();
  }

  public stop(): void {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
      this.countdownSub = null;
    }
    this.timeLeftSubject.next(0);
  }

  private restartCountdown(): void {
    this.stop();
    const seconds = Math.ceil(this.tickIntervalMs / 1000);
    this.timeLeftSubject.next(seconds);

    this.countdownSub = interval(1000).subscribe(() => {
      const current = this.timeLeftSubject.getValue();
      if (current > 0) {
        this.timeLeftSubject.next(current - 1);
      }
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
