import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { PaginationEvent } from '@shared/interfaces/pagination-event.interface';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];

  @Output() pageChange = new EventEmitter<PaginationEvent>();

  totalPages: number = 1;
  pages: (number | string)[] = [];

  get rangeStart(): number {
    if (this.totalItems === 0) return 0;
    const page = Math.max(1, this.currentPage);
    return (page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    if (this.totalItems === 0) return 0;
    const page = Math.max(1, this.currentPage);
    return Math.min(page * this.pageSize, this.totalItems);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalItems'] || changes['pageSize']) {
      this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    this.generatePageNumbers();
  }

  onPageClick(page: number | string): void {
    if (page === '...') return;
    this.setPage(Number(page));
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    this.currentPage = page;
    this.emitChange();
    this.generatePageNumbers();
  }

  onPageSizeChange(event: any): void {
    this.pageSize = Number(event.target.value);
    this.currentPage = 1;
    this.emitChange();
  }

  private emitChange(): void {
    this.pageChange.emit({
      page: this.currentPage,
      limit: this.pageSize,
    });
  }

  private generatePageNumbers(): void {
    const total = this.totalPages;
    const current = Math.max(1, this.currentPage);
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l!) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    this.pages = rangeWithDots;
  }
}
