import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsEvent } from '../enums/ws-event.enum';
import { FileLogger } from '../logger/file-logger';
import { JoinServerRoomDto } from 'src/servers/dto/join-server-room.dto';
import { ServerStatus } from 'src/servers/enums/server-status.enum';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';
import { VillagesService } from 'src/villages/services/villages.service';
import { forwardRef, Inject } from '@nestjs/common';
import { BuildingsService } from 'src/buildings/services/buildings.service';
import { CreateBuildingWsDto } from 'src/buildings/dto/create-building-ws.dto';
import { DeleteBuildingWsDto } from 'src/buildings/dto/delete-building-ws.dto';
import { MoveBuildingWsDto } from 'src/buildings/dto/move-building-ws.dto';
import { ExpandVillageWsDto } from 'src/villages/dto/expand-village-ws.dto';
import { FriendRequestsRepository } from 'src/friend-requests/repositories/friend-requests.repository';
import { FriendRequestStatus } from '../enums/friend-request-status.enum';
import { GetVillageWsDto } from 'src/villages/dto/get-village-ws.dto';
import { UpgradeBuildingWsDto } from 'src/buildings/dto/upgrade-building-ws.dto';
import { ChatGroupsService } from 'src/chat/services/chat-groups.service';
import { DirectMessagesService } from 'src/chat/services/direct-messages.service';
import { QuestsService } from 'src/quests/services/quests.service';
import { QuestObjectiveType } from '@core/enums/quest-objective-type.enum';
import { BattlesService } from 'src/battle/services/battles.service';

export interface AuthenticatedSocket extends Socket {
  user: User;
}

@WebSocketGateway({ cors: true })
export class WsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => VillagesService))
    private readonly villagesService: VillagesService,
    @Inject(forwardRef(() => BuildingsService))
    private readonly buildingsService: BuildingsService,
    private readonly friendRequestsRepository: FriendRequestsRepository,
    private readonly logger: FileLogger,
    @Inject(forwardRef(() => DirectMessagesService))
    private readonly dmService: DirectMessagesService,
    @Inject(forwardRef(() => ChatGroupsService))
    private readonly chatGroupsService: ChatGroupsService,
    @Inject(forwardRef(() => QuestsService))
    private readonly questsService: QuestsService,
    @Inject(forwardRef(() => BattlesService))
    private readonly battlesService: BattlesService,
  ) {}

  afterInit(server: Server) {
    this.battlesService.setServer(server);
    this.logger.log('WebSocket Gateway Initialized and ready.');
  }

  async handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.auth.token?.split(' ')[1];
    const serverId =
      client.handshake.query.serverId || client.handshake.auth.serverId;

    if (!token) {
      this.logger.warn(
        `Client ${client.id} connected without token. Disconnecting.`,
      );
      return client.disconnect();
    }

    try {
      const payload = await this.jwtService.verify(token);

      const user = await this.usersService.findOneByEmail(payload.email);

      if (!user) {
        this.logger.warn(
          `User not found for token. Disconnecting client ${client.id}`,
        );
        return client.disconnect();
      }

      const userRoom = `user-${user.id}`;
      client.join(userRoom);

      const userGroups = await this.chatGroupsService.getUserGroups(user.id);
      userGroups.forEach((group) => {
        client.join(`group-${group.id}`);
      });

      client.user = user;
      await this.usersService.setUserOnlineStatus(user.email, true);

      if (serverId) {
        await this.usersService.setActualUserServer(user.email, +serverId);
        this.logger.log(
          `User ${user.email} connected to Server ID: ${serverId}`,
        );
      }

      this.logger.log(
        `Client connected and authenticated: ${user.email} (ID: ${client.id})`,
      );

      const pendingRequestsCount = await this.friendRequestsRepository.count({
        where: {
          receiver: { id: user.id },
          status: FriendRequestStatus.PENDING,
        },
      });

      this.sendToUser(user.id, WsEvent.PENDING_FRIEND_REQUESTS_COUNT, {
        count: pendingRequestsCount,
      });

      this.server.emit(WsEvent.USER_CONNECTED, {
        userId: user.id,
        email: user.email,
      });

      const activeBattle = this.battlesService.getActiveBattleForUser(
        client.user.id,
      );
      if (activeBattle) {
        client.emit(WsEvent.BATTLE_UPDATE, {
          attacker: activeBattle.attackerArmy,
          defender: activeBattle.defenderArmy,
          buildings: activeBattle.buildings.map((b) => ({
            id: b.id,
            health: b.health,
            row: b.row,
            col: b.col,
          })),
        });
      }
    } catch (error) {
      console.log(error.message);
      this.logger.error(
        `Token validation failed. Disconnecting client ${client.id}`,
      );
      return client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user && client.user.email) {
      await this.usersService.setUserOnlineStatus(client.user.email, false);
      this.logger.log(
        `Client disconnected: ${client.user.email} (ID: ${client.id})`,
      );
      this.server.emit(WsEvent.USER_DISCONNECTED, {
        userId: client.user.id,
        email: client.user.email,
      });
    } else {
      this.logger.log(`Unauthenticated client disconnected (ID: ${client.id})`);
    }
  }

  public sendToUser(userId: number, event: WsEvent, payload: any): void {
    const userRoom = `user-${userId}`;
    this.server.to(userRoom).emit(event, payload);
  }

  private getServerStatusRoomName(hostname: string, port: number): string {
    return `server-status-${hostname}:${port}`;
  }

  @SubscribeMessage('joinServerStatusRoom')
  async handleJoinServerStatusRoom(
    @MessageBody() data: JoinServerRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = this.getServerStatusRoomName(data.hostname, data.port);
    client.join(roomName);
    await this.usersService.setActualUserServer(data.userEmail, data.serverId);
    this.logger.log(`Client ${client.id} joined room: ${roomName}`);
  }

  emitServerStatusUpdate(
    hostname: string,
    port: number,
    status: ServerStatus,
    lastChecked: Date,
  ) {
    const roomName = this.getServerStatusRoomName(hostname, port);
    this.server
      .to(roomName)
      .emit('serverStatusUpdate', { hostname, port, status, lastChecked });
  }

  @SubscribeMessage(WsEvent.ARMY_CREATE)
  async onArmyCreate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: any,
  ) {
    this.server.emit(WsEvent.ARMY_UPDATE, { action: 'create', payload });
    if (client.user && payload.serverId && payload.unitType) {
      await this.questsService.checkProgress(
        client.user.id,
        payload.serverId,
        QuestObjectiveType.TRAIN,
        payload.type,
        payload.count || 1,
      );
    }
    return { status: 'ok' };
  }

  @SubscribeMessage(WsEvent.ARMY_UPGRADE)
  onArmyUpgrade(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    this.server.emit(WsEvent.ARMY_UPDATE, { action: 'upgrade', payload });
    return { status: 'ok' };
  }

  @SubscribeMessage(WsEvent.GET_VILLAGE_DATA)
  async handleGetVillageData(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: GetVillageWsDto,
  ) {
    this.logger.log(`User ${client.user.email} requested village data.`);
    try {
      const villageData =
        await this.villagesService.getVillageForUserAndServerId(
          client.user.id,
          payload.serverId,
        );

      if (!villageData) {
        throw new Error('Village not found for user.');
      }

      this.sendToUser(client.user.id, WsEvent.VILLAGE_DATA_UPDATE, villageData);
    } catch (error) {
      this.logger.error(
        `Failed to get village data for ${client.user.email}: ${error.message}`,
      );
      this.sendToUser(client.user.id, WsEvent.VILLAGE_DATA_ERROR, {
        message: 'Could not load village data.',
      });
    }
  }

  @SubscribeMessage(WsEvent.BUILDING_CREATE)
  async handleBuildingCreate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: CreateBuildingWsDto,
  ) {
    this.logger.log(
      `User ${client.user.email} requested to create a building: ${payload.name}`,
    );
    try {
      await this.buildingsService.createForUser(client.user.id, payload);

      await this.questsService.checkProgress(
        client.user.id,
        payload.serverId,
        QuestObjectiveType.BUILD,
        payload.name,
        1,
      );

      this.handleGetVillageData(client, { serverId: payload.serverId });
    } catch (error) {
      this.logger.error(
        `Failed to create building for ${client.user.email}: ${error.message}`,
      );
    }
  }

  @SubscribeMessage(WsEvent.BUILDING_UPGRADE)
  async handleBuildingUpgrade(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpgradeBuildingWsDto,
  ) {
    this.logger.log(
      `User ${client.user.email} upgrading building ${payload.buildingId}`,
    );
    try {
      const building = await this.buildingsService.startUpgradeForUser(
        client.user.id,
        payload,
      );

      this.sendToUser(client.user.id, WsEvent.BUILDING_UPDATE, building);

      if (building && building.upgradeFinishedAt) {
        const finishTime =
          new Date(building.upgradeFinishedAt).getTime() - Date.now();

        setTimeout(async () => {
          const finishedBuilding = await this.buildingsService.finalizeUpgrade(
            building.id,
          );

          this.sendToUser(
            client.user.id,
            WsEvent.BUILDING_FINISHED,
            finishedBuilding,
          );

          await this.questsService.checkProgress(
            client.user.id,
            payload.serverId,
            QuestObjectiveType.UPGRADE_BUILDING,
            finishedBuilding.name,
            1,
          );
        }, finishTime);
      }
    } catch (error) {
      this.logger.error(`Upgrade failed: ${error.message}`);
    }
  }

  @SubscribeMessage(WsEvent.BUILDING_REPAIR)
  async handleBuildingRepair(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { buildingId: number; serverId: number },
  ) {
    this.logger.log(
      `User ${client.user.email} repairing building ${payload.buildingId}`,
    );
    try {
      const building = await this.buildingsService.startRepairForUser(
        client.user.id,
        payload.buildingId,
      );

      this.sendToUser(client.user.id, WsEvent.BUILDING_UPDATE, building);

      if (building && building.repairFinishedAt) {
        const finishTime =
          new Date(building.repairFinishedAt).getTime() - Date.now();

        setTimeout(async () => {
          const finishedBuilding = await this.buildingsService.finalizeRepair(
            building.id,
          );

          this.sendToUser(
            client.user.id,
            WsEvent.BUILDING_FINISHED,
            finishedBuilding,
          );
        }, finishTime);
      }
    } catch (error) {
      this.logger.error(`Repair failed: ${error.message}`);
    }
  }

  @SubscribeMessage(WsEvent.BUILDING_MOVE)
  async handleBuildingMove(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: MoveBuildingWsDto,
  ) {
    this.logger.log(
      `User ${client.user.email} requested to move building ${payload.buildingId}`,
    );
    try {
      await this.buildingsService.moveForUser(client.user.id, payload);
    } catch (error) {
      this.logger.error(
        `Failed to move building for ${client.user.email}: ${error.message}`,
      );
    }
  }

  @SubscribeMessage(WsEvent.BUILDING_DELETE)
  async handleBuildingDelete(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: DeleteBuildingWsDto,
  ) {
    this.logger.log(
      `User ${client.user.email} requested to delete building ${payload.buildingId}`,
    );
    try {
      await this.buildingsService.removeForUser(client.user.id, payload);
    } catch (error) {
      this.logger.error(
        `Failed to delete building for ${client.user.email}: ${error.message}`,
      );
    }
  }

  @SubscribeMessage(WsEvent.VILLAGE_EXPAND)
  async handleVillageExpand(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ExpandVillageWsDto,
  ) {
    this.logger.log(
      `Użytkownik ${client.user.email} zażądał rozszerzenia wioski w stronę: ${payload.side}`,
    );

    try {
      await this.villagesService.expandVillage(client.user.id, payload);

      this.logger.log(
        `Pomyślnie rozszerzono wioskę dla ${client.user.email}. Wysyłanie aktualizacji.`,
      );

      await this.questsService.checkProgress(
        client.user.id,
        payload.serverId,
        QuestObjectiveType.EXPAND,
        'village',
        1,
      );

      await this.handleGetVillageData(client, { serverId: payload.serverId });
    } catch (error) {
      this.logger.error(
        `Błąd podczas rozszerzania wioski dla ${client.user.email}: ${error.message}`,
      );

      this.sendToUser(client.user.id, WsEvent.VILLAGE_DATA_ERROR, {
        message: error.message || 'Nie udało się rozszerzyć wioski.',
      });
    }
  }

  @SubscribeMessage(WsEvent.GET_VILLAGE_BY_EMAIL)
  async handleGetVillageByEmail(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { email: string },
  ) {
    this.logger.log(
      `Użytkownik ${client.user.email} żąda danych wioski użytkownika: ${payload.email}`,
    );

    if (!payload.email) {
      client.emit(WsEvent.VILLAGE_BY_EMAIL_ERROR, {
        message: 'Nie podano adresu email.',
      });
      return;
    }

    try {
      const targetUser = await this.usersService.findOneByEmail(payload.email);

      if (!targetUser) {
        throw new Error('Nie znaleziono użytkownika o podanym adresie email.');
      }

      const villageData = await this.villagesService.getVillageForUser(
        targetUser.id,
      );

      if (!villageData) {
        throw new Error('Użytkownik nie posiada wioski.');
      }

      client.emit(WsEvent.VILLAGE_BY_EMAIL_UPDATE, {
        email: targetUser.email,
        village: villageData,
      });
    } catch (error) {
      this.logger.error(
        `Błąd pobierania wioski po mailu dla ${client.user.email}: ${error.message}`,
      );
      client.emit(WsEvent.VILLAGE_BY_EMAIL_ERROR, {
        message: error.message || 'Wystąpił błąd podczas pobierania danych.',
      });
    }
  }

  @SubscribeMessage(WsEvent.DIRECT_MESSAGE_SEND)
  async onDirectMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { receiverId: number; content: string },
  ) {
    const msg = await this.dmService.send(client.user.id, {
      receiverId: payload.receiverId,
      content: payload.content,
    });

    client.emit(WsEvent.DIRECT_MESSAGE_SEND, {
      message: msg,
      senderId: client.user.id,
    });
  }

  @SubscribeMessage(WsEvent.GROUP_MESSAGE_SEND)
  async onGroupMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { groupId: number; content: string },
  ) {
    const msg = await this.chatGroupsService.sendMessage(
      client.user.id,
      payload.groupId,
      {
        content: payload.content,
      },
    );

    client.emit(WsEvent.GROUP_MESSAGE_SEND, {
      groupId: payload.groupId,
      message: msg,
    });
  }

  @SubscribeMessage(WsEvent.JOIN_DM_ROOM)
  handleJoinDmRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { friendId: number },
  ) {
    const roomName = this.getDmRoomName(client.user.id, payload.friendId);
    client.join(roomName);
    this.logger.log(`User ${client.user.id} joined DM room: ${roomName}`);
  }

  @SubscribeMessage(WsEvent.LEAVE_DM_ROOM)
  handleLeaveDmRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { friendId: number },
  ) {
    const roomName = this.getDmRoomName(client.user.id, payload.friendId);
    client.leave(roomName);
    this.logger.log(`User ${client.user.id} left DM room: ${roomName}`);
  }

  @SubscribeMessage(WsEvent.JOIN_GROUP_ROOM)
  handleJoinGroupRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { groupId: number },
  ) {
    const groupName = this.getGroupRoomName(payload.groupId);
    client.join(groupName);
    this.logger.log(`User ${client.user.id} joined GROUP room: ${groupName}`);
  }

  @SubscribeMessage(WsEvent.LEAVE_GROUP_ROOM)
  handleLeaveGroupRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { groupId: number },
  ) {
    const groupName = this.getGroupRoomName(payload.groupId);
    client.leave(groupName);
    this.logger.log(`User ${client.user.id} left GROUP room: ${groupName}`);
  }

  public sendDirectMessageToRoom(
    senderId: number,
    receiverId: number,
    payload: any,
  ) {
    const roomName = this.getDmRoomName(senderId, receiverId);

    this.server.to(roomName).emit(WsEvent.DIRECT_MESSAGE_RECEIVED, payload);
  }

  public sendGroupMessageToRoom(groupId: number, payload: any) {
    const roomName = this.getGroupRoomName(groupId);
    this.server.to(roomName).emit(WsEvent.GROUP_MESSAGE_RECEIVED, payload);
  }

  @SubscribeMessage(WsEvent.ATTACK_START)
  async handleAttackStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { targetEmail: string; serverId: number },
  ) {
    try {
      await this.battlesService.startBattle(
        client.user.id,
        payload.targetEmail,
        payload.serverId,
      );
    } catch (error) {
      client.emit(WsEvent.BATTLE_ERROR, { message: error.message });
    }
  }

  private getDmRoomName(userId1: number, userId2: number): string {
    const [min, max] = [userId1, userId2].sort((a, b) => a - b);
    return `dm-${min}-${max}`;
  }

  private getGroupRoomName(groupId: number): string {
    return `group-${groupId}`;
  }
}
