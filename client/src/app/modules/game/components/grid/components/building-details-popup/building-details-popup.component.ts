import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BuildingData, RadialMenuOption } from '@shared/models';

@Component({
  selector: 'app-building-details-popup',
  templateUrl: './building-details-popup.component.html',
  styleUrls: ['./building-details-popup.component.scss'],
})
export class BuildingDetailsPopupComponent {
  @Input() building: BuildingData | null = null;
  @Input() resources: any;
  @Input() availableBuildings: BuildingData[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() demolish = new EventEmitter<void>();
  @Output() build = new EventEmitter<any>();
  @Output() upgrade = new EventEmitter<any>();
  buildMode = false;
  upgradeMode = false;
  menuOptions: RadialMenuOption[] = [
    {
      action: 'create',
      iconUrl: 'assets/icons/plus.svg',
      tooltip: 'Stwórz',
    },
    {
      action: 'edit',
      iconUrl: 'assets/icons/edit.svg',
      tooltip: 'Edytuj (Wkrótce)',
    },
    {
      action: 'destroy',
      iconUrl: 'assets/icons/trash.svg',
      tooltip: 'Usuń',
    },
    {
      action: 'upgrade',
      iconUrl: 'assets/icons/upgrade.svg',
      tooltip: 'Rozbuduj',
    },
  ];

  openBuild() {
    this.buildMode = true;
  }

  openUpgrade() {
    this.upgradeMode = true;
  }

  closeModals() {
    this.buildMode = false;
    this.upgradeMode = false;
  }

  onBuild(event: any) {
    this.build.emit(event);
    this.closeModals();
  }

  onUpgrade(event: any) {
    this.upgrade.emit(event);
    this.closeModals();
  }

  onRadialAction(action: string) {
    switch (action) {
      case 'create':
        this.openBuild();
        break;
      case 'edit':
        break;
      case 'destroy':
        this.demolish.emit();
        break;
      case 'upgrade':
        this.openUpgrade();
        break;
    }
  }
}
