export enum WebSocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',
  CHAT_MESSAGE = 'chat_message',
  RESOURCE_UPDATE = 'resource_update',
  ARMY_CREATE = 'army_create',
  ARMY_UPGRADE = 'army_upgrade',
  ARMY_UPDATE = 'army_update',
  CLAN_INVITE = 'clan_invite',
  CLAN_INVITE_ACCEPT = 'clan_invite_accept',
  GENERIC = 'generic',
}
