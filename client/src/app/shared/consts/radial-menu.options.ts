import { RadialMenuOption } from '../models';

export const EMPTY_PLOT_OPTIONS: RadialMenuOption[] = [
  {
    action: 'build',
    iconUrl: '/assets/icons/key.png',
    tooltip: 'Zbuduj nowy budynek',
  },
  {
    action: 'inspect',
    iconUrl: '/assets/icons/info.png',
    tooltip: 'Informacje o polu',
  },
];

export const BUILDING_OPTIONS: RadialMenuOption[] = [
  {
    action: 'details',
    iconUrl: '/assets/icons/info.png',
    tooltip: 'DETAILS',
  },
  {
    action: 'upgrade',
    iconUrl: '/assets/icons/building_upgrade.png',
    tooltip: 'upgradeModal.BTN_UPGRADE',
  },
  {
    action: 'destroy',
    iconUrl: '/assets/icons/trash.png',
    tooltip: 'DELETE',
  },
  // {
  //   action: 'edit',
  //   iconUrl: '/assets/icons/pencil.png',
  //   tooltip: 'Edytuj',
  // },
];
