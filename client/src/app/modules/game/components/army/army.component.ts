import { Component, OnInit } from '@angular/core';
import { ServerService } from '@modules/game/services';
import { ArmyService } from '@modules/game/services/army.service';
import { UNIT_CONFIG } from '@shared/consts/unit-config';
import { UnitType } from '@shared/enums';
import { UnitView } from '@shared/interfaces';
import { ArmyUnit } from '@shared/models';
import { ToastrService } from '@shared/services';

@Component({
  selector: 'app-army',
  templateUrl: './army.component.html',
  styleUrls: ['./army.component.scss'],
})
export class ArmyComponent implements OnInit {
  units: UnitView[] = [];
  selectedUnit: UnitView | null = null;
  createAmount = 1;

  private currentServerId: number | null = null;

  constructor(
    private readonly armyService: ArmyService,
    private readonly serverService: ServerService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const server = this.serverService.getServer();
    if (server && server.id) {
      this.currentServerId = server.id;
      this.loadArmy();
    } else {
      this.toastr.showError('Nie wybrano serwera.');
    }
  }

  loadArmy() {
    if (!this.currentServerId) return;

    this.armyService.getArmy(this.currentServerId).subscribe({
      next: (res) => {
        this.units = this.mapToViewModel(res.data);
      },
      error: () => {
        this.units = this.mapToViewModel([]);
      },
    });
  }

  selectUnit(unit: UnitView) {
    this.selectedUnit = unit;
    this.createAmount = 1;
  }

  createUnits() {
    if (!this.selectedUnit || !this.currentServerId) return;

    this.armyService
      .recruitUnit(
        this.currentServerId,
        this.selectedUnit.type,
        this.createAmount
      )
      .subscribe({
        next: (res) => {
          this.updateUnitInList(res.data);
          this.toastr.showSuccess(`Zrekrutowano: ${this.selectedUnit?.name}`);
        },
        error: (err) => {
          this.toastr.showError(err.error?.message || 'Wystąpił błąd.');
        },
      });
  }

  upgradeUnit(unit: UnitView, event: Event) {
    event.stopPropagation();
    if (!this.currentServerId) return;

    this.armyService.upgradeUnit(this.currentServerId, unit.type).subscribe({
      next: (res) => {
        this.updateUnitInList(res.data);
        this.toastr.showSuccess(
          `Ulepszono: ${unit.name} (Lv. ${res.data.level})`
        );
      },
      error: (err) => {
        this.toastr.showError(err.error?.message || 'Brak surowców.');
      },
    });
  }

  getRecruitCost(unit: UnitView) {
    return {
      wood: unit.baseCost.wood * this.createAmount,
      clay: unit.baseCost.clay * this.createAmount,
      iron: unit.baseCost.iron * this.createAmount,
    };
  }

  getUpgradeCost(unit: UnitView) {
    const nextLevel = unit.level + 1;
    return {
      wood: unit.baseCost.wood * nextLevel * 2,
      clay: unit.baseCost.clay * nextLevel * 2,
      iron: unit.baseCost.iron * nextLevel * 2,
    };
  }

  private mapToViewModel(serverData: ArmyUnit[]): UnitView[] {
    const serverMap = new Map(serverData.map((u) => [u.type, u]));

    return Object.values(UnitType).map((type) => {
      const serverUnit = serverMap.get(type);
      const config = UNIT_CONFIG[type];

      return {
        ...config,
        type: type,
        id: serverUnit?.id,
        count: serverUnit ? serverUnit.count : 0,
        level: serverUnit ? serverUnit.level : 1,
        villageId: 0,
      };
    });
  }

  private updateUnitInList(updated: ArmyUnit) {
    const index = this.units.findIndex((u) => u.type === updated.type);
    if (index !== -1) {
      this.units[index] = {
        ...this.units[index],
        count: updated.count,
        level: updated.level,
        id: updated.id,
      };

      if (this.selectedUnit?.type === updated.type) {
        this.selectedUnit = this.units[index];
      }
    }
  }
}
