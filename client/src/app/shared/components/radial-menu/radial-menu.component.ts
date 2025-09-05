import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { RadialMenuOption } from '../../models';

@Component({
  selector: 'app-radial-menu',
  templateUrl: './radial-menu.component.html',
  styleUrl: './radial-menu.component.scss',
})
export class RadialMenuComponent implements OnInit {
  @Input() menuOptions: RadialMenuOption[] = [];
  @Input() showToggle: boolean = true;
  @Input() forceOpen: boolean = false;
  @Output() optionSelected = new EventEmitter<string>();

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      if (this.showToggle) {
        this.isOpen = false;
      }
    }
  }

  ngOnInit(): void {
    if (this.forceOpen) {
      this.isOpen = true;
    }
  }

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
