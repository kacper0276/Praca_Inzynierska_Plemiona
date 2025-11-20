import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ColumnDefinition } from '../../interfaces/column-definition.interface';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.scss',
})
export class EditModalComponent {
  @Input() item: any | null = null;
  @Input() columns: ColumnDefinition[] = [];
  @Input() isVisible: boolean = false;

  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  editableItem: any = {};

  get formColumns(): ColumnDefinition[] {
    return this.columns.filter((col) => !col.isAction);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.editableItem = JSON.parse(JSON.stringify(this.item));
    }
  }

  getValue(col: ColumnDefinition): any {
    const item = this.editableItem;
    if (
      col.editField &&
      item &&
      typeof item[col.key] === 'object' &&
      item[col.key] !== null
    ) {
      return item[col.key][col.editField];
    }
    return item ? item[col.key] : '';
  }

  updateValue(col: ColumnDefinition, value: any): void {
    const item = this.editableItem;
    if (
      col.editField &&
      item &&
      typeof item[col.key] === 'object' &&
      item[col.key] !== null
    ) {
      item[col.key][col.editField] = value;
    } else if (item) {
      item[col.key] = value;
    }
  }

  isBooleanField(key: string): boolean {
    return typeof this.editableItem?.[key] === 'boolean';
  }

  saveChanges(): void {
    this.save.emit(this.editableItem);
  }

  deleteItem(): void {
    this.delete.emit(this.item);
  }

  closeModal(): void {
    this.close.emit();
  }
}
