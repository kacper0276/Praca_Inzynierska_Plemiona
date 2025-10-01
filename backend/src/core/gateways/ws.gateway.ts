import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsEvent } from '../enums/ws-event.enum';

@WebSocketGateway({ cors: true })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('WS client connected', client.id);
    this.server.emit(WsEvent.CONNECT, { clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    console.log('WS client disconnected', client.id);
    this.server.emit(WsEvent.DISCONNECT, { clientId: client.id });
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
