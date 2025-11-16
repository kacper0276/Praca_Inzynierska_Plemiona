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
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => VillagesService))
    private readonly villagesService: VillagesService,
    @Inject(forwardRef(() => BuildingsService))
    private readonly buildingsService: BuildingsService,
    private readonly logger: FileLogger,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized and ready.');
  }

  async handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.auth.token?.split(' ')[1];

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

      client.user = user;
      await this.usersService.setUserOnlineStatus(user.email, true);
      this.logger.log(
        `Client connected and authenticated: ${user.email} (ID: ${client.id})`,
      );

      this.server.emit(WsEvent.USER_CONNECTED, {
        userId: user.id,
        email: user.email,
      });
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
  handleJoinServerStatusRoom(
    @MessageBody() data: JoinServerRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = this.getServerStatusRoomName(data.hostname, data.port);
    client.join(roomName);
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
  onArmyCreate(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    console.log('Army create received', payload);
    this.server.emit(WsEvent.ARMY_UPDATE, { action: 'create', payload });
    return { status: 'ok' };
  }

  @SubscribeMessage(WsEvent.ARMY_UPGRADE)
  onArmyUpgrade(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    console.log('Army upgrade received', payload);
    this.server.emit(WsEvent.ARMY_UPDATE, { action: 'upgrade', payload });
    return { status: 'ok' };
  }

  @SubscribeMessage(WsEvent.GET_VILLAGE_DATA)
  async handleGetVillageData(@ConnectedSocket() client: AuthenticatedSocket) {
    this.logger.log(`User ${client.user.email} requested village data.`);
    try {
      const villageData = await this.villagesService.getVillageForUser(
        client.user.id,
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
      this.handleGetVillageData(client);
    } catch (error) {
      this.logger.error(
        `Failed to create building for ${client.user.email}: ${error.message}`,
      );
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
      await this.handleGetVillageData(client);
    } catch (error) {
      this.logger.error(
        `Błąd podczas rozszerzania wioski dla ${client.user.email}: ${error.message}`,
      );

      this.sendToUser(client.user.id, WsEvent.VILLAGE_DATA_ERROR, {
        message: error.message || 'Nie udało się rozszerzyć wioski.',
      });
    }
  }
}
