import { Component, OnInit } from '@angular/core';
import { ServerService, RankingService } from '@modules/game/services';
import { ColumnDefinition, PaginationEvent } from '@shared/interfaces';
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
