import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BuildingData } from '../../../../shared/models';
import { Resources } from '../../../../shared/models/resources.model';

@Component({
  selector: 'app-build-modal',
  templateUrl: './build-modal.component.html',
  styleUrls: ['./build-modal.component.scss'],
})
export class BuildModalComponent {
  @Input() availableBuildings: BuildingData[] = [];
  @Input() resources!: Resources;
  @Input() buildRow: number | null = null;
  @Input() buildCol: number | null = null;
  @Input() buildMode: boolean = false;
  @Output() build = new EventEmitter<{
    building: BuildingData;
    cost: Partial<Resources>;
  }>();
  @Output() close = new EventEmitter<void>();

  getCost(building: BuildingData): Partial<Resources> {
    // TODO: Dodać większą logikę
    return { wood: 100, clay: 50, iron: 30, population: 5 };
  }

  canBuild(cost: Partial<Resources>): boolean {
    if (!this.resources) return false;
    return Object.entries(cost).every(
      ([key, value]) => (this.resources as any)[key] >= value!
    );
  }
}
