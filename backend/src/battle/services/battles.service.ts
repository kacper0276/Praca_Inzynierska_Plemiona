import { WsEvent } from '@core/enums/ws-event.enum';
import { BattleState } from '../models/battle-state.model';
import { ArmyRuntimeData } from '../models/army-runtime-data.model';
import { UNIT_STATS } from '@core/consts/unit-stats';
import { ArmyUnit } from 'src/army/entities/army-unit.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { UsersService } from 'src/users/services/users.service';
import { VillagesService } from 'src/villages/services/villages.service';

@Injectable()
export class BattlesService {
  private activeBattles: Map<number, BattleState> = new Map();
  private server: Server;

  constructor(
    @Inject(forwardRef(() => VillagesService))
    private readonly villagesService: VillagesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  public setServer(server: Server) {
    this.server = server;
  }

  public getActiveBattleForUser(userId: number): BattleState | undefined {
    for (const battle of this.activeBattles.values()) {
      if (battle.attackerId === userId || battle.defenderId === userId) {
        return battle;
      }
    }
    return undefined;
  }

  async startBattle(attackerId: number, targetEmail: string, serverId: number) {
    const defender = await this.usersService.findOneByEmail(targetEmail);
    if (!defender) throw new Error('Defender not found');

    if (
      this.getActiveBattleForUser(attackerId) ||
      this.getActiveBattleForUser(defender.id)
    ) {
      throw new Error('Player already in battle');
    }

    const attackerVillageEntity = await this.villagesService.getByUserId(
      attackerId,
      serverId,
    );
    const defenderVillageEntity = await this.villagesService.getByUserId(
      defender.id,
      serverId,
    );

    const startXAttacker = 50;
    const startYAttacker = 400;

    const startXDefender = 400;
    const startYDefender = 50;

    const attackerArmyData = this.prepareArmyData(
      attackerVillageEntity.armyUnits,
      startXAttacker,
      startYAttacker,
    );
    const defenderArmyData = this.prepareArmyData(
      defenderVillageEntity.armyUnits,
      startXDefender,
      startYDefender,
    );

    const defenderBuildings = defenderVillageEntity.buildings
      .filter((b) => b !== null)
      .map((b) => ({
        id: b.id,
        name: b.name,
        row: b.row,
        col: b.col,
        maxHealth: b.maxHealth || 100,
        health: b.health !== undefined ? b.health : b.maxHealth || 100,
      }));

    const battle: BattleState = {
      attackerId,
      defenderId: defender.id,
      attackerArmy: attackerArmyData,
      defenderArmy: defenderArmyData,
      buildings: defenderBuildings,
      interval: null,
    };

    this.findNextTarget(battle);

    battle.interval = setInterval(() => this.battleTick(battle), 100);
    this.activeBattles.set(attackerId, battle);
  }

  private prepareArmyData(
    units: ArmyUnit[],
    startX: number,
    startY: number,
  ): ArmyRuntimeData {
    let totalHp = 0;
    let totalDmg = 0;

    const runtimeUnits = units.map((u) => {
      const stats = UNIT_STATS[u.type] || { hp: 50, dmg: 5 };
      const hp = stats.hp * u.count;
      const dmg = stats.dmg * u.count;
      totalHp += hp;
      totalDmg += dmg;
      return {
        type: u.type,
        count: u.count,
        initialCount: u.count,
        level: u.level,
      };
    });

    if (totalHp === 0) {
      totalHp = 100;
      totalDmg = 5;
    }

    return {
      x: startX,
      y: startY,
      targetX: startX,
      targetY: startY,
      state: 'idle',
      totalHp,
      maxHp: totalHp,
      damage: totalDmg,
      units: runtimeUnits,
    };
  }

  private battleTick(battle: BattleState) {
    this.moveArmy(battle.attackerArmy, 15);
    this.moveArmy(battle.defenderArmy, 12);

    const dist = this.calculateDistance(
      battle.attackerArmy,
      battle.defenderArmy,
    );

    if (
      dist < 50 &&
      battle.attackerArmy.totalHp > 0 &&
      battle.defenderArmy.totalHp > 0
    ) {
      battle.attackerArmy.state = 'fighting_army';
      battle.defenderArmy.state = 'fighting_army';

      const attDmg = Math.max(1, battle.attackerArmy.damage / 50);
      const defDmg = Math.max(1, battle.defenderArmy.damage / 50);

      this.applyDamageToArmy(battle.attackerArmy, defDmg);
      this.applyDamageToArmy(battle.defenderArmy, attDmg);
    } else {
      if (battle.defenderArmy.totalHp > 0) {
        battle.defenderArmy.state = 'marching';
        battle.defenderArmy.targetX = battle.attackerArmy.x;
        battle.defenderArmy.targetY = battle.attackerArmy.y;
      }

      if (battle.attackerArmy.state !== 'attacking_building') {
        battle.attackerArmy.state = 'marching';
      }
    }

    if (battle.attackerArmy.state === 'attacking_building') {
      this.handleBuildingAttack(battle);
    }

    this.broadcastUpdate(battle);

    if (battle.attackerArmy.totalHp <= 0) {
      this.endBattle(battle, 'defender');
    } else if (
      battle.defenderArmy.totalHp <= 0 &&
      !this.findNextTarget(battle, false)
    ) {
      this.endBattle(battle, 'attacker');
    }
  }

  private handleBuildingAttack(battle: BattleState) {
    const target = battle.buildings.find(
      (b) => b.id === battle.attackerArmy.targetId,
    );

    if (target) {
      const dmg = Math.max(5, battle.attackerArmy.damage / 40);
      target.health -= dmg;

      if (target.health <= 0) {
        target.health = 0;
        this.findNextTarget(battle);
      }
    } else {
      this.findNextTarget(battle);
    }
  }

  private findNextTarget(battle: BattleState, move: boolean = true): boolean {
    const target = battle.buildings.find((b) => b.health > 0);

    if (target) {
      if (move) {
        const coords = this.getBuildingCoords(target.row, target.col);
        battle.attackerArmy.targetX = coords.x;
        battle.attackerArmy.targetY = coords.y;
        battle.attackerArmy.targetId = target.id;
        battle.attackerArmy.state = 'marching';
      }
      return true;
    }

    battle.attackerArmy.state = 'marching';
    battle.attackerArmy.targetX = battle.defenderArmy.x;
    battle.attackerArmy.targetY = battle.defenderArmy.y;
    return false;
  }

  private moveArmy(army: ArmyRuntimeData, speed: number) {
    if (army.state !== 'marching') return;

    const dx = army.targetX - army.x;
    const dy = army.targetY - army.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < speed) {
      army.x = army.targetX;
      army.y = army.targetY;

      if (army.targetId !== undefined) {
        army.state = 'attacking_building';
      }
    } else {
      army.x += (dx / distance) * speed;
      army.y += (dy / distance) * speed;
    }
  }

  private applyDamageToArmy(army: ArmyRuntimeData, dmg: number) {
    army.totalHp = Math.max(0, army.totalHp - dmg);
    const healthPct = army.maxHp > 0 ? army.totalHp / army.maxHp : 0;

    army.units.forEach((u) => {
      u.count = Math.floor(u.initialCount * healthPct);
    });
  }

  private broadcastUpdate(battle: BattleState) {
    if (!this.server) return;

    const payload = {
      attacker: {
        x: battle.attackerArmy.x,
        y: battle.attackerArmy.y,
        totalHp: battle.attackerArmy.totalHp,
        maxHp: battle.attackerArmy.maxHp,
        state: battle.attackerArmy.state,
      },
      defender: {
        x: battle.defenderArmy.x,
        y: battle.defenderArmy.y,
        totalHp: battle.defenderArmy.totalHp,
        maxHp: battle.defenderArmy.maxHp,
        state: battle.defenderArmy.state,
      },
      buildings: battle.buildings.map((b) => ({
        id: b.id,
        health: b.health,
        row: b.row,
        col: b.col,
      })),
    };

    this.server
      .to(`user-${battle.attackerId}`)
      .emit(WsEvent.BATTLE_UPDATE, payload);
    this.server
      .to(`user-${battle.defenderId}`)
      .emit(WsEvent.BATTLE_UPDATE, payload);
  }

  private async endBattle(
    battle: BattleState,
    winner: 'attacker' | 'defender',
  ) {
    clearInterval(battle.interval);
    this.activeBattles.delete(battle.attackerId);

    try {
      await this.villagesService.applyBattleResults(
        battle.attackerId,
        battle.defenderId,
        {
          attackerUnits: battle.attackerArmy.units.map((u) => ({
            type: u.type,
            count: u.count,
          })),
          defenderUnits: battle.defenderArmy.units.map((u) => ({
            type: u.type,
            count: u.count,
          })),
          buildings: battle.buildings.map((b) => ({
            id: b.id,
            health: b.health,
          })),
        },
      );
    } catch (error) {
      console.error('Failed to save battle results to DB', error);
    }

    if (!this.server) return;

    const result = {
      winner,
      attackerLosses: battle.attackerArmy.units.map((u) => ({
        type: u.type,
        lost: u.initialCount - u.count,
      })),
      defenderLosses: battle.defenderArmy.units.map((u) => ({
        type: u.type,
        lost: u.initialCount - u.count,
      })),
    };

    this.server
      .to(`user-${battle.attackerId}`)
      .emit(WsEvent.BATTLE_ENDED, result);
    this.server
      .to(`user-${battle.defenderId}`)
      .emit(WsEvent.BATTLE_ENDED, result);
  }

  private calculateDistance(a: any, b: any) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  private getBuildingCoords(row: number, col: number) {
    const CELL_SIZE = 100;
    const GAP = 5;
    const PADDING = 20;
    const OFFSET_CENTER = 50;

    return {
      x: PADDING + col * (CELL_SIZE + GAP) + OFFSET_CENTER,
      y: PADDING + row * (CELL_SIZE + GAP) + OFFSET_CENTER,
    };
  }
}
