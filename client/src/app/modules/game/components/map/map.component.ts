import { Component } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {
  tiles: number[][] = [
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ];
}
