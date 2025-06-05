import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
})
export class OrderByPipe implements PipeTransform {
  transform<T>(array: T[], field: string, desc: boolean = false): T[] {
    if (!Array.isArray(array) || !field) return array;

    const getValue = (obj: any, path: string) =>
      path.split('.').reduce((acc, part) => acc && acc[part], obj);

    return [...array].sort((a, b) => {
      const aValue = getValue(a, field);
      const bValue = getValue(b, field);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return desc ? 1 : -1;
      if (bValue == null) return desc ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = Date.parse(aValue);
        const bDate = Date.parse(bValue);
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return desc ? bDate - aDate : aDate - bDate;
        }
        return desc
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return desc ? bValue - aValue : aValue - bValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return desc
          ? bValue.getTime() - aValue.getTime()
          : aValue.getTime() - bValue.getTime();
      }

      return 0;
    });
  }
}
