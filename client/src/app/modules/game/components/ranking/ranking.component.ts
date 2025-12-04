import { Component, OnInit } from '@angular/core';
import { RankingService } from '@modules/game/services/ranking.service';
import { ServerService } from '@modules/game/services/server.service';
import { ColumnDefinition } from '@shared/interfaces/column-definition.interface';
import { Ranking } from '@shared/models';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss',
})
export class RankingComponent implements OnInit {
  ranking: Ranking[] = [];
  rankingColumns: ColumnDefinition[] = [
    {
      key: 'position',
      header: 'Miejsce',
    },
    {
      key: 'username',
      header: 'Nazwa użytkownika',
    },
    { key: 'score', header: 'Ilość punktów' },
  ];

  constructor(
    private readonly serverService: ServerService,
    private readonly rankingService: RankingService
  ) {}

  ngOnInit(): void {
    this.rankingService
      .getRankingForServer(this.serverService.getServer()?.name ?? '')
      .subscribe({
        next: (res) => {
          this.ranking = res.data;
        },
        error: () => {
          // TODO: Dodać komunikat
          console.log('Błąd');
        },
      });
  }
}
