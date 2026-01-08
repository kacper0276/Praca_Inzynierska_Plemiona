import { Component, Input, HostBinding, HostListener } from '@angular/core';

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss'],
})
export class BuildingComponent {
  @Input() name: string = 'Pusty plac';
  @Input() level: number = 0;
  @Input() imageUrl: string = 'assets/images/empty_plot.png';
  @Input() health?: number;
  @Input() maxHealth?: number;
  @Input() draggable?: boolean;

  @HostBinding('attr.draggable') get draggableAttr() {
    return this.draggable ? 'true' : null;
  }

  @HostListener('dragstart', ['$event'])
  onNativeDragStart(event: DragEvent) {
    try {
      event.dataTransfer?.setData('text/plain', '');
    } catch (e) {}
  }
}
