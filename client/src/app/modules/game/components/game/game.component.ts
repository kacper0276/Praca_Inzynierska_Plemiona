import { Component } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {
  isModalOpen = true;

  joinedServerId: string | null = null;

  servers = [
    { id: 's1-alpha', name: 'Świat Alfa' },
    { id: 's2-beta', name: 'Świat Beta' },
    { id: 's3-gamma', name: 'Świat Gamma' },
  ];

  selectedServerInModal: string = this.servers[0].id;

  resources = {
    wood: 1250,
    clay: 1180,
    iron: 980,
    population: 120,
    maxPopulation: 150,
  };

  closeModal(): void {
    this.isModalOpen = false;
    console.log('Modal został zamknięty bez wyboru serwera.');
  }

  joinGame(): void {
    if (this.selectedServerInModal) {
      this.joinedServerId = this.selectedServerInModal;
      this.isModalOpen = false;
      console.log(`Dołączono do serwera: ${this.joinedServerId}`);
    }
  }
}
