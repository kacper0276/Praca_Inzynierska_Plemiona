export enum WebSocketEvent {
  USER_CONNECTED = 'userConnected',
  USER_DISCONNECTED = 'userDisconnected',
  PING = 'ping',
  PONG = 'pong',
  CHAT_MESSAGE = 'chat_message',

  // Resource
  RESOURCE_UPDATE = 'resource_update',

  // Army
  ARMY_UPDATE = 'army_update',
  ARMY_CREATE = 'army_create',
  ARMY_UPGRADE = 'army_upgrade',

  // Village
  GET_VILLAGE_DATA = 'getVillageData',
  VILLAGE_DATA_UPDATE = 'villageDataUpdate',
  VILLAGE_DATA_ERROR = 'villageDataError',
}
