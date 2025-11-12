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

@WebSocketGateway({ cors: true })
export class WsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private logger = new FileLogger('WsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized and ready.');
  }

  handleConnection(client: Socket) {
    this.server.emit(WsEvent.USER_CONNECTED, { clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.server.emit(WsEvent.USER_DISCONNECTED, { clientId: client.id });
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
