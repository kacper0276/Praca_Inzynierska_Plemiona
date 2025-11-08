import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Resources } from '../../../shared/models/resources.model';
import { HttpService } from '../../../shared/services/http.service';
import { ApiResponse } from '../../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private resourcesSubject = new BehaviorSubject<Resources>({
    wood: 0,
    clay: 0,
    iron: 0,
    population: 0,
    maxPopulation: 0,
  });

  public resources$: Observable<Resources> =
    this.resourcesSubject.asObservable();

  constructor(private readonly httpService: HttpService) {}

  public fetchResources(email: string): Observable<ApiResponse<Resources>> {
    return this.httpService.get<Resources>(`/resources/user/${email}`);
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
}
