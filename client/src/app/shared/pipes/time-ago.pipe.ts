import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    return formatDistanceToNow(new Date(value), {
      addSuffix: true,
      locale: pl,
    });
  }
}
