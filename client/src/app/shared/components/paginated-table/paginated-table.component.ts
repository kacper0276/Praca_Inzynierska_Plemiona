import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ColumnDefinition,
  ActionEvent,
  PaginationEvent,
} from '@shared/interfaces';

@Component({
  selector: 'app-paginated-table',
  templateUrl: './paginated-table.component.html',
  styleUrl: './paginated-table.component.scss',
})
export class PaginatedTableComponent {
  @Input() columns: ColumnDefinition[] = [];
  @Input() data: any[] = [];
  @Input() dataModifier?: (item: any, columnKey: string) => any;

  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageNumber: number = 1;

  @Input() rowClickable: boolean = true;
  @Input() rowClassFn: (item: any) => string = () => '';

  @Output() action = new EventEmitter<ActionEvent>();
  @Output() pageChange = new EventEmitter<PaginationEvent>();

  getCellValue(item: any, columnKey: string): any {
    const value = item[columnKey];
    if (this.dataModifier) {
      return this.dataModifier(item, columnKey);
    }
    return value;
  }

  getRowClass(item: any): string {
    const customClass = this.rowClassFn ? this.rowClassFn(item) : '';
    const clickableClass = this.rowClickable ? 'row-clickable' : '';
    return `${customClass} ${clickableClass}`;
  }

  onEdit(item: any): void {
    if (!this.rowClickable) return;
    this.action.emit({ action: 'edit', item });
  }

  onActionEdit(item: any): void {
    this.action.emit({ action: 'edit', item });
  }

  onDelete(item: any): void {
    this.action.emit({ action: 'delete', item });
  }

  onPaginationChange(event: PaginationEvent): void {
    this.pageChange.emit(event);
  }
}
