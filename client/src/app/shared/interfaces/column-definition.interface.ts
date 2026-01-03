import { ColumnOption } from './column-option.interface';

export interface ColumnDefinition {
  key: string;
  header: string;
  isAction?: boolean;
  editField?: string;
  isReadOnly?: boolean;
  type?: 'text' | 'checkbox' | 'select' | 'number';
  options?: ColumnOption[];
}
