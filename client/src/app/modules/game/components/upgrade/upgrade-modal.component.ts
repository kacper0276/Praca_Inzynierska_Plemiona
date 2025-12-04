import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BuildingData, Resources } from '@shared/models';

@Component({
  selector: 'app-upgrade-modal',
  templateUrl: './upgrade-modal.component.html',
  styleUrls: ['./upgrade-modal.component.scss'],
})
export class UpgradeModalComponent {
  @Input() building: BuildingData | null = null;
  @Input() resources!: Resources;
  @Output() upgrade = new EventEmitter<{ cost: Partial<Resources> }>();
  @Output() close = new EventEmitter<void>();

  getUpgradeCost(): Partial<Resources> {
    if (!this.building) return {};
    return {
      wood: 100 * (this.building.level + 1),
      clay: 50 * (this.building.level + 1),
      iron: 30 * (this.building.level + 1),
      population: 5,
    };
  }

  canUpgrade(cost: Partial<Resources>): boolean {
    if (!this.resources) return false;
    return Object.entries(cost).every(
      ([key, value]) => (this.resources as any)[key] >= value!
    );
  }
}
