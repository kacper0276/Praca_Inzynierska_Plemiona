import { RadialMenuOption } from '../models';

export const EMPTY_PLOT_OPTIONS: RadialMenuOption[] = [
  {
    action: 'build',
    iconName: 'build',
    tooltip: 'Zbuduj nowy budynek',
  },
  {
    action: 'inspect',
    iconName: 'search',
    tooltip: 'Informacje o polu',
  },
];

export const BUILDING_OPTIONS: RadialMenuOption[] = [
  {
    action: 'details',
    iconName: 'info',
    tooltip: 'Szczegóły',
  },
  {
    action: 'upgrade',
    iconName: 'upgrade',
    tooltip: 'Rozbuduj',
  },
  {
    action: 'destroy',
    iconName: 'delete',
    tooltip: 'Usuń',
  },
  {
    action: 'edit',
    iconName: 'edit',
    tooltip: 'Edytuj',
  },
];
