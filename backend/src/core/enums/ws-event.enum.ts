export enum WsEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',
  CHAT_MESSAGE = 'chat_message',
  RESOURCE_UPDATE = 'resource_update',
  ARMY_UPDATE = 'army_update',
  ARMY_CREATE = 'army_create',
  ARMY_UPGRADE = 'army_upgrade',
}
