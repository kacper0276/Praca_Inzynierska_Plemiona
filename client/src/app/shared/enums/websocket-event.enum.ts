export enum WebSocketEvent {
  USER_CONNECTED = 'user_connected',
  USER_DISCONNECTED = 'user_disconnected',
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
  GET_VILLAGE_DATA = 'get_village_data',
  VILLAGE_DATA_UPDATE = 'village_data_update',
  VILLAGE_DATA_ERROR = 'village_data_error',
  VILLAGE_EXPAND = 'village_expand',
  GET_VILLAGE_BY_EMAIL = 'get_village_by_email',
  VILLAGE_BY_EMAIL_UPDATE = 'village_by_email_update',
  VILLAGE_BY_EMAIL_ERROR = 'village_by_email_error',

  // Building
  BUILDING_CREATE = 'building_create',
  BUILDING_MOVE = 'building_move',
  BUILDING_DELETE = 'building_delete',

  // Friend
  FRIEND_REQUEST_RECEIVED = 'friend_request_received',
  PENDING_FRIEND_REQUESTS_COUNT = 'pending_friend_requests_count',
}
