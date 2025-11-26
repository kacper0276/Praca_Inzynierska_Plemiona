import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MultiSelectItem } from '../../interfaces/multi-select-item.interface';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
})
export class MultiSelectComponent {
  @Input() items: MultiSelectItem[] = [];
  @Input() placeholder: string = 'Wybierz...';

  @Output() selectionChange = new EventEmitter<MultiSelectItem[]>();

  selectedItems: MultiSelectItem[] = [];
  filteredItems: MultiSelectItem[] = [];
  searchQuery: string = '';
  isOpen: boolean = false;

  constructor(private eRef: ElementRef) {}

  ngOnChanges() {
    this.filteredItems = this.items;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.filterItems();
    }
  }

  filterItems() {
    const query = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }

  selectItem(item: MultiSelectItem) {
    if (!this.isSelected(item)) {
      this.selectedItems.push(item);
      this.emitChange();
    }
    this.searchQuery = '';
    this.filterItems();
    // this.isOpen = false;
  }

  removeItem(item: MultiSelectItem, event: Event) {
    event.stopPropagation();
    this.selectedItems = this.selectedItems.filter((i) => i.id !== item.id);
    this.emitChange();
  }

  isSelected(item: MultiSelectItem): boolean {
    return this.selectedItems.some((i) => i.id === item.id);
  }

  emitChange() {
    this.selectionChange.emit(this.selectedItems);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
