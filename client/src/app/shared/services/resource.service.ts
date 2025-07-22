import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Resources } from '../models/resources.model';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private resourcesSubject = new BehaviorSubject<Resources>({
    wood: 1250,
    clay: 1180,
    iron: 980,
    population: 120,
    maxPopulation: 150,
  });

  public resources$: Observable<Resources> =
    this.resourcesSubject.asObservable();

  constructor() {}

  public addResource(
    resource: keyof Omit<Resources, 'maxPopulation'>,
    amount: number
  ): void {
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
