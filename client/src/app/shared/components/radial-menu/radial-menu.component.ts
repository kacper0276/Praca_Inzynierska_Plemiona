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
  styleUrls: ['./radial-menu.component.scss'],
})
export class RadialMenuComponent implements OnInit {
  @Input() menuOptions: RadialMenuOption[] = [];
  @Input() showToggle: boolean = true;
  @Input() forceOpen: boolean = false;
  @Output() optionSelected = new EventEmitter<string>();
  @Output() toggled = new EventEmitter<boolean>();

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      if (this.showToggle) {
        this.isOpen = false;
        this.toggled.emit(false);
      }
    }
  }

  ngOnInit(): void {
    if (this.forceOpen) {
      this.isOpen = true;
      this.toggled.emit(true);
    }
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
    this.toggled.emit(this.isOpen);
  }

  selectOption(action: string): void {
    this.optionSelected.emit(action);
    this.isOpen = false;
    this.toggled.emit(false);
  }

  get menuStyles() {
    return { '--item-count': this.menuOptions.length };
  }
}
