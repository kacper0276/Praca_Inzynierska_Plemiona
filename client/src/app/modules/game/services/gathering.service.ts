import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription, timer } from 'rxjs';
import { ResourceService } from './resource.service';
import { BuildingData } from '../../../shared/models';

export interface GatheringConfig {
  tickIntervalMs: number;
}

@Injectable({ providedIn: 'root' })
export class GatheringService implements OnDestroy {
  private runningSub: Subscription | null = null;
  private buildingsRef: (() => (BuildingData | null)[][]) | null = null;

  private config: GatheringConfig = { tickIntervalMs: 10000 };

  private timeLeftSubject = new BehaviorSubject<number>(0);
  public timeLeft$ = this.timeLeftSubject.asObservable();

  private countdownSub: Subscription | null = null;

  constructor(private resourceService: ResourceService) {}

  public start(
    buildingsRef: () => (BuildingData | null)[][],
    config?: Partial<GatheringConfig>
  ) {
    if (this.runningSub) return;
    if (config) this.config = { ...this.config, ...config };
    this.buildingsRef = buildingsRef;

    const seconds = Math.ceil(this.config.tickIntervalMs / 1000);
    this.timeLeftSubject.next(seconds);

    this.countdownSub = interval(1000).subscribe(() => {
      const current = this.timeLeftSubject.getValue();
      if (current <= 1) {
        this.timeLeftSubject.next(0);
      } else {
        this.timeLeftSubject.next(current - 1);
      }
    });

    this.runningSub = interval(this.config.tickIntervalMs).subscribe(() => {
      this.processTick();
      this.timeLeftSubject.next(seconds);
    });
  }

  public stop() {
    if (this.runningSub) {
      this.runningSub.unsubscribe();
      this.runningSub = null;
    }
    this.buildingsRef = null;
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
      this.countdownSub = null;
    }
    this.timeLeftSubject.next(0);
  }

  private processTick() {
    if (!this.buildingsRef) return;
    const matrix = this.buildingsRef();
    // Simple rules: specific building names grant resources per level
    // - Farma: wood (represents food/wood) -> produce 10 * level
    // - Spichlerz (storage) doesn't produce
    // - Kuźnia (forge) -> iron production 5 * level
    // - Ratusz / Koszary -> no direct resources in this simple model

    let addWood = 0;
    let addClay = 0;
    let addIron = 0;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        const b = matrix[r][c];
        if (!b) continue;
        const lvl = Math.max(1, b.level || 1);
        const name = (b.name || '').toLowerCase();
        if (name.includes('farma') || name.includes('farm')) {
          addWood += 10 * lvl;
        } else if (
          name.includes('kuźnia') ||
          name.includes('kuznia') ||
          name.includes('forge')
        ) {
          addIron += 5 * lvl;
        } else if (name.includes('spichlerz') || name.includes('storage')) {
          addClay += 2 * lvl;
        }
      }
    }

    if (addWood) this.resourceService.addResource('wood', addWood);
    if (addClay) this.resourceService.addResource('clay', addClay);
    if (addIron) this.resourceService.addResource('iron', addIron);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
