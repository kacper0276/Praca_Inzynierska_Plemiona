import { Injectable, OnDestroy } from '@angular/core';
import { WebSocketEvent } from '@shared/enums';
import { ApiResponse, Resources } from '@shared/models';
import { HttpService } from '@shared/services/http.service';
import { WebSocketService } from '@shared/services/web-socket.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResourcesService implements OnDestroy {
  private resourcesSubject = new BehaviorSubject<Resources>({
    wood: 0,
    clay: 0,
    iron: 0,
    population: 0,
    maxPopulation: 0,
  });

  public resources$: Observable<Resources> =
    this.resourcesSubject.asObservable();

  private resourceUpdateSub: Subscription | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly webSocketService: WebSocketService
  ) {
    this.resourceUpdateSub = this.webSocketService
      .onEvent<Resources>(WebSocketEvent.RESOURCE_UPDATE)
      .subscribe((message) => {
        if (message.payload) {
          this.setResources(message.payload);
        }
      });
  }

  public fetchResources(email: string): Observable<ApiResponse<Resources>> {
    return this.httpService.get<Resources>(`/resources/user/${email}`);
  }

  public fetchAllResources(): Observable<ApiResponse<Resources[]>> {
    return this.httpService.get<Resources[]>(`/resources`);
  }

  public setResources(resources: Resources): void {
    this.resourcesSubject.next(resources);
  }

  public addResource(resource: keyof Resources, amount: number): void {
    const currentResources = this.resourcesSubject.getValue();

    const updatedResources: Resources = {
      ...currentResources,
      [resource]: currentResources[resource] + amount,
    };

    this.resourcesSubject.next(updatedResources);
  }

  public spendResources(costs: Partial<Resources>): boolean {
    const currentResources = this.resourcesSubject.getValue();

    for (const key in costs) {
      if (Object.prototype.hasOwnProperty.call(costs, key)) {
        const resourceKey = key as keyof Resources;
        const cost = costs[resourceKey];
        if (cost !== undefined && currentResources[resourceKey] < cost) {
          // TODO: Add translation
          console.error(`Brak wystarczającej ilości surowca: ${resourceKey}`);
          return false;
        }
      }
    }

    const updatedResources = { ...currentResources };
    for (const key in costs) {
      if (Object.prototype.hasOwnProperty.call(costs, key)) {
        const resourceKey = key as keyof Resources;
        const cost = costs[resourceKey];
        if (cost !== undefined) {
          updatedResources[resourceKey] -= cost;
        }
      }
    }

    this.resourcesSubject.next(updatedResources);
    return true;
  }

  ngOnDestroy(): void {
    if (this.resourceUpdateSub) {
      this.resourceUpdateSub.unsubscribe();
    }
  }
}
