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
  BUILDING_UPGRADE = 'building_upgrade',
  BUILDING_FINISHED = 'building_finished',
  BUILDING_REPAIR = 'building_repair',
  BUILDING_UPDATE = 'building_update',

  // Friend
  FRIEND_REQUEST_RECEIVED = 'friend_request_received',
  PENDING_FRIEND_REQUESTS_COUNT = 'pending_friend_requests_count',

  // Message
  JOIN_DM_ROOM = 'join_dm_room',
  LEAVE_DM_ROOM = 'leave_dm_room',
  DIRECT_MESSAGE_SEND = 'direct_message_send',
  DIRECT_MESSAGE_RECEIVED = 'direct_message_received',

  JOIN_GROUP_ROOM = 'join_group_room',
  LEAVE_GROUP_ROOM = 'leave_group_room',
  GROUP_MESSAGE_SEND = 'group_message_send',
  GROUP_MESSAGE_RECEIVED = 'group_message_received',

  // Quest
  QUEST_UPDATE = 'quest_update',
  QUEST_COMPLETED = 'quest_completed',

  // Battle
  ATTACK_START = 'attack_start',
  BATTLE_UPDATE = 'battle_update',
  BATTLE_ENDED = 'battle_ended',
  BATTLE_ERROR = 'battle_error',
}
