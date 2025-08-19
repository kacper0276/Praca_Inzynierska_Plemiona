import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BuildingData } from '../../../../../../shared/models';

@Component({
  selector: 'app-building-details-popup',
  templateUrl: './building-details-popup.component.html',
  styleUrls: ['./building-details-popup.component.scss'],
})
export class BuildingDetailsPopupComponent {
  @Input() building: BuildingData | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() demolish = new EventEmitter<void>();
}
