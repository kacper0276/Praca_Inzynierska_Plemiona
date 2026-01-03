export interface ActionEvent {
  action: 'edit' | 'delete' | 'create';
  item: any;
}
