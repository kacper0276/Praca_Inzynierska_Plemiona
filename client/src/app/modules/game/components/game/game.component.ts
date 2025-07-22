import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Resources } from '../../../../shared/models/resources.model';
import { ResourceService } from '../../../../shared/services/resource.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  isModalOpen = true;
  joinedServerId: string | null = null;

  servers = [
    { id: 's1-alpha', name: 'Świat Alfa' },
    { id: 's2-beta', name: 'Świat Beta' },
    { id: 's3-gamma', name: 'Świat Gamma' },
  ];
  selectedServerInModal: string = this.servers[0].id;

  resources$!: Observable<Resources>;

  constructor(private readonly resourceService: ResourceService) {}

  ngOnInit(): void {
    this.resources$ = this.resourceService.resources$;
  }

  public buildFarm(): void {
    const cost = { wood: 75, clay: 50, iron: 20, population: 5 };
    if (this.resourceService.spendResources(cost)) {
      console.log('Zbudowano farmę!');
    } else {
      console.log('Nie udało się zbudować farmy - za mało surowców.');
    }
  }

  public collectWood(): void {
    this.resourceService.addResource('wood', 100);
    console.log('Zebrano 100 drewna.');
  }

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
