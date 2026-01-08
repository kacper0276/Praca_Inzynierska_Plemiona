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

  objectiveTypes = [
    { value: 'BUILD', label: 'Wybuduj' },
    { value: 'UPGRADE_BUILDING', label: 'Ulepsz budynek' },
    { value: 'TRAIN', label: 'Wytrenuj' },
    { value: 'GATHER', label: 'Zbierz surowce' },
    { value: 'EXPAND', label: 'Rozszerz teren' },
  ];

  get formColumns(): ColumnDefinition[] {
    return this.columns.filter((col) => !col.isAction && !col.isReadOnly);
  }

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible']?.currentValue === true) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newItem = {};
    if (this.objectives) {
      this.newItem.objectives = [];
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

  addObjective(): void {
    if (!this.objectives) return;

    this.newItem.objectives.push({
      description: '',
      type: 'BUILD',
      target: '',
      goalCount: 1,
      woodReward: 0,
      clayReward: 0,
      ironReward: 0,
    });

    setTimeout(() => {
      const content = document.querySelector('.modal-content');
      if (content) content.scrollTop = content.scrollHeight;
    }, 100);
  }

  removeObjective(index: number): void {
    if (!this.objectives) return;
    this.newItem.objectives.splice(index, 1);
  }

  saveChanges(): void {
    const payload = { ...this.newItem };

    payload.woodReward = Number(payload.woodReward) || 0;
    payload.clayReward = Number(payload.clayReward) || 0;
    payload.ironReward = Number(payload.ironReward) || 0;
    payload.populationReward = Number(payload.populationReward) || 0;

    if (this.objectives && Array.isArray(payload.objectives)) {
      payload.objectives = payload.objectives.map((obj: any) => ({
        ...obj,
        goalCount: Number(obj.goalCount) || 1,
        woodReward: Number(obj.woodReward) || 0,
        clayReward: Number(obj.clayReward) || 0,
        ironReward: Number(obj.ironReward) || 0,
        description: obj.description || '',
        type: obj.type || 'BUILD',
        target: obj.target || '',
      }));
    }

    this.save.emit(payload);
  }

  closeModal(): void {
    this.close.emit();
  }
}
