import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ResourceCost, BUILDING_COSTS } from '@shared/consts/building-costs';
import { BuildingName } from '@shared/enums';
import { BuildingData, Resources } from '@shared/models';

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

  getCost(building: BuildingData): Partial<ResourceCost> {
    return BUILDING_COSTS[building.name as BuildingName];
  }

  canBuild(cost: Partial<Resources>): boolean {
    if (!this.resources) return false;
    return Object.entries(cost).every(
      ([key, value]) => (this.resources as any)[key] >= value!
    );
  }
}
