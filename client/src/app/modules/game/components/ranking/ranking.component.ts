import { Component, OnInit } from '@angular/core';
import { ServerService, RankingService } from '@modules/game/services';
import { ColumnDefinition, PaginationEvent } from '@shared/interfaces';
import { Ranking } from '@shared/models';
import { ToastrService } from '@shared/services';
import { TranslateService } from '@ngx-translate/core';

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
      header: 'ranking.HEADERS.POSITION',
    },
    {
      key: 'username',
      header: 'ranking.HEADERS.USERNAME',
    },
    {
      key: 'score',
      header: 'ranking.HEADERS.SCORE',
    },
  ];

  totalItems: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;

  constructor(
    private readonly serverService: ServerService,
    private readonly rankingService: RankingService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService
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
          this.toastr.showError(
            this.translate.instant('ranking.ERRORS.FETCH_FAILED')
          );
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
