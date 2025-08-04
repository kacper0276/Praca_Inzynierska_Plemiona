import { Component } from '@angular/core';

@Component({
  selector: 'app-barracks',
  templateUrl: './barracks.component.html',
  styleUrls: ['./barracks.component.scss'],
})
export class BarracksComponent {
  units: { name: string; count: number }[] = [
    { name: 'Wojownik', count: 10 },
    { name: 'Łucznik', count: 5 },
  ];
}
