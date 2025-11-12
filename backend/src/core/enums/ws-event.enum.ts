export enum WsEvent {
  USER_CONNECTED = 'userConnected',
  USER_DISCONNECTED = 'userDisconnected',
  PING = 'ping',
  PONG = 'pong',
  CHAT_MESSAGE = 'chat_message',
  RESOURCE_UPDATE = 'resource_update',
  ARMY_UPDATE = 'army_update',
  ARMY_CREATE = 'army_create',
  ARMY_UPGRADE = 'army_upgrade',
}
