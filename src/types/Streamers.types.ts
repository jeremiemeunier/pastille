export interface StreamerTypes {
  _id?: string;
  id: string;
  name: string;
  isLive: boolean;
  isAnnounce: boolean;
  isValid: boolean;
  announcer: StreamerAnnouncerTypes[];
  apiSubscriptionId: string;
}

export interface StreamerAnnouncerTypes {
  guild_id: string;
  channel_id: string;
  role_id: string;
  message: string;
  progress: boolean;
}
