import { Component, Input } from '@angular/core';

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

  onClick() {
    console.log(`Kliknięto budynek: ${this.name}, poziom: ${this.level}`);
  }
}
