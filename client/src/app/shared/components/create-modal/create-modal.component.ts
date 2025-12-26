import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ColumnDefinition } from '@shared/interfaces';

@Component({
  selector: 'app-create-modal',
  templateUrl: './create-modal.component.html',
  styleUrl: './create-modal.component.scss',
})
export class CreateModalComponent implements OnChanges {
  @Input() columns: ColumnDefinition[] = [];
  @Input() isVisible: boolean = false;

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  newItem: any = {};

  get formColumns(): ColumnDefinition[] {
    return this.columns.filter((col) => !col.isAction && !col.isReadOnly);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']?.currentValue === true) {
      this.newItem = {};
      this.formColumns.forEach((col) => {
        if (col.type === 'checkbox') {
          this.newItem[col.key] = false;
        } else if (col.type === 'select' && col.options?.length) {
          this.newItem[col.key] = col.options[0].value;
        }
      });
    }
  }

  updateValue(col: ColumnDefinition, value: any): void {
    this.newItem[col.key] = value;
  }

  saveChanges(): void {
    this.save.emit(this.newItem);
  }

  closeModal(): void {
    this.close.emit();
  }
}
