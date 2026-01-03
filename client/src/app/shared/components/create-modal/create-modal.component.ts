import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ColumnDefinition } from '@shared/interfaces';

@Component({
  selector: 'app-create-modal',
  templateUrl: './create-modal.component.html',
  styleUrl: './create-modal.component.scss',
})
export class CreateModalComponent implements OnInit, OnChanges {
  @Input() columns: ColumnDefinition[] = [];
  @Input() isVisible: boolean = false;
  @Input() objectives: boolean = false;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  newItem: any = {};

  get formColumns(): ColumnDefinition[] {
    return this.columns.filter((col) => !col.isAction && !col.isReadOnly);
  }

  ngOnInit(): void {
    if (this.objectives) {
      this.newItem = {
        objectives: [],
      };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']?.currentValue === true) {
      if (this.objectives) {
        this.newItem = {
          objectives: [],
        };
      }
      this.formColumns.forEach((col) => {
        if (col.type === 'checkbox') {
          this.newItem[col.key] = false;
        } else if (col.type === 'select' && col.options?.length) {
          this.newItem[col.key] = col.options[0].value;
        } else if (col.type === 'number') {
          this.newItem[col.key] = 0;
        } else {
          this.newItem[col.key] = '';
        }
      });
    }
  }

  addObjective(): void {
    if (!this.objectives) return;

    this.newItem.objectives.push({
      description: '',
      goalCount: 1,
      woodReward: 0,
      clayReward: 0,
      ironReward: 0,
    });
  }

  removeObjective(index: number): void {
    if (!this.objectives) return;

    this.newItem.objectives.splice(index, 1);
  }

  saveChanges(): void {
    this.save.emit(this.newItem);
  }

  closeModal(): void {
    this.close.emit();
  }
}
