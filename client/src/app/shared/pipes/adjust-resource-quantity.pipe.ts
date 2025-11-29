import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'adjustResourceQuantity',
})
export class AdjustResourceQuantityPipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): string {
    if (value < 1000) {
      return String(value);
    } else if (value > 999 && value < 1000000) {
      return `${Math.floor(value / 1000)}K`;
    } else {
      return `${Math.floor(value / 1000000)}KK`;
    }
  }
}
