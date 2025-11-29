import { RadialMenuOption } from '../models';

export const EMPTY_PLOT_OPTIONS: RadialMenuOption[] = [
  {
    action: 'build',
    // iconName: 'build',
    iconUrl: '/assets/icons/key.png',
    tooltip: 'Zbuduj nowy budynek',
  },
  {
    action: 'inspect',
    // iconName: 'search',
    iconUrl: '/assets/icons/pencil.png',
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
    // iconName: 'delete',
    iconUrl: '/assets/icons/trash.png',
    tooltip: 'Usuń',
  },
  {
    action: 'edit',
    // iconName: 'edit',
    iconUrl: '/assets/icons/pencil.png',
    tooltip: 'Edytuj',
  },
];
