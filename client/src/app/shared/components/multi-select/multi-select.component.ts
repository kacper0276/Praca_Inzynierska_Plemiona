import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent implements ControlValueAccessor {
  @Input() items: Array<{ id: number; label: string }> = [];

  selected: number[] = [];

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(obj: any): void {
    this.selected = Array.isArray(obj) ? obj : [];
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggle(id: number) {
    const idx = this.selected.indexOf(id);
    if (idx >= 0) this.selected.splice(idx, 1);
    else this.selected.push(id);
    this.onChange(this.selected.slice());
  }
}
