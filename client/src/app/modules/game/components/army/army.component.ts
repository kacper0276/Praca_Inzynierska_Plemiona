import { Component, OnInit } from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
import { Unit } from '../../../../shared/models';
import { UnitType } from '../../../../shared/enums';

@Component({
  selector: 'app-army',
  templateUrl: './army.component.html',
  styleUrls: ['./army.component.scss'],
})
export class ArmyComponent implements OnInit {
  units: Unit[] = [];
  selectedUnitId: UnitType | null = null;
  createAmount = 1;

  constructor(private resourcesService: ResourcesService) {}

  ngOnInit(): void {
    this.units = [
      {
        unitType: UnitType.WARRIOR,
        name: 'Wojownik',
        level: 1,
        count: 10,
        cost: { wood: 10, clay: 0, iron: 5 },
      },
      {
        unitType: UnitType.ARCHER,
        name: 'Łucznik',
        level: 1,
        count: 5,
        cost: { wood: 15, clay: 0, iron: 3 },
      },
      {
        unitType: UnitType.PIKEMAN,
        name: 'Pikinier',
        level: 1,
        count: 2,
        cost: { wood: 5, clay: 5, iron: 0 },
      },
    ];
  }

  selectUnit(id: UnitType) {
    this.selectedUnitId = id;
  }

  get selectedUnit() {
    return (
      this.units.find(
        (u) => u.unitType === (this.selectedUnitId as UnitType)
      ) || null
    );
  }

  createUnits() {
    if (!this.selectedUnit) return;
    const amount = Math.max(1, Math.floor(this.createAmount));
    const totalCost = {
      wood: this.selectedUnit.cost.wood * amount,
      clay: this.selectedUnit.cost.clay * amount,
      iron: this.selectedUnit.cost.iron * amount,
    };

    const spent = this.resourcesService.spendResources(totalCost as any);
    if (!spent) return;
    this.selectedUnit.count += amount;
  }

  upgradeUnit(unit: Unit) {
    const upgradeCost = {
      wood: Math.round(unit.cost.wood * 2),
      clay: Math.round(unit.cost.clay * 2),
      iron: Math.round(unit.cost.iron * 2),
    };

    const spent = this.resourcesService.spendResources(upgradeCost as any);
    if (!spent) return;
    unit.level += 1;
    unit.cost = upgradeCost;
  }

  private canAfford(cost: { wood: number; stone: number; iron: number }) {
    let current: any = null;
    try {
      this.resourcesService.resources$
        .subscribe((val) => (current = val))
        .unsubscribe();
    } catch (e) {
      return false;
    }

    if (!current) return false;
    return (
      (current.wood || 0) >= cost.wood &&
      (current.clay || current.stone || 0) >= cost.stone &&
      (current.iron || 0) >= cost.iron
    );
  }
}
