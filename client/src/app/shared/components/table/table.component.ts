import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnDefinition } from '../../interfaces/column-definition.interface';
import { ActionEvent } from '../../interfaces/action-event.interface';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  @Input() columns: ColumnDefinition[] = [];
  @Input() data: any[] = [];
  @Input() dataModifier?: (item: any, columnKey: string) => any;
  @Output() action = new EventEmitter<ActionEvent>();

  get displayedColumns(): string[] {
    return this.columns.map((c) => c.key);
  }

  getCellValue(item: any, columnKey: string): any {
    const value = item[columnKey];
    if (this.dataModifier) {
      return this.dataModifier(item, columnKey);
    }
    return value;
  }

  onEdit(item: any): void {
    this.action.emit({ action: 'edit', item });
  }

  onDelete(item: any): void {
    this.action.emit({ action: 'delete', item });
  }
}
