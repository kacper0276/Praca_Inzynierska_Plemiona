import { Component, OnInit } from '@angular/core';
import { RankingService } from '@modules/game/services/ranking.service';
import { ServerService } from '@modules/game/services/server.service';
import { ColumnDefinition } from '@shared/interfaces/column-definition.interface';
import { PaginationEvent } from '@shared/interfaces/pagination-event.interface';
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

  totalItems: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;

  constructor(
    private readonly serverService: ServerService,
    private readonly rankingService: RankingService
  ) {}

  ngOnInit(): void {
    this.loadRanking();
  }

  loadRanking(): void {
    const serverName = this.serverService.getServer()?.name;
    if (!serverName) return;

    this.rankingService
      .getRankingForServer(serverName, this.pageNumber, this.pageSize)
      .subscribe({
        next: (res) => {
          this.ranking = res.data.items;
          this.totalItems = res.data.total;
        },
        error: () => {
          console.error('Błąd pobierania rankingu');
        },
      });
  }

  onPageChange(event: PaginationEvent): void {
    this.pageNumber = event.page;
    this.pageSize = event.limit;
    this.loadRanking();
  }

  getRowClass = (item: Ranking): string => {
    return item.isYou ? 'status-success' : '';
  };
}
