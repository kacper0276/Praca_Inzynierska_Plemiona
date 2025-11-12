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

export interface AuthenticatedSocket extends Socket {
  user: User;
}

@WebSocketGateway({ cors: true })
export class WsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private logger = new FileLogger('WsGateway');

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
}
