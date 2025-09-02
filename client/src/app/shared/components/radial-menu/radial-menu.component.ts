import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RadialMenuOption } from '../../models';

@Component({
  selector: 'app-radial-menu',
  templateUrl: './radial-menu.component.html',
  styleUrl: './radial-menu.component.scss',
})
export class RadialMenuComponent {
  @Input() menuOptions: RadialMenuOption[] = [];
  @Output() optionSelected = new EventEmitter<string>();

  isOpen = false;

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  selectOption(action: string): void {
    this.optionSelected.emit(action);
    this.isOpen = false;
  }

  get menuStyles() {
    return { '--item-count': this.menuOptions.length };
  }
}
