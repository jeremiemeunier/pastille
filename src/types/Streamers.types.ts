export interface StreamerTypes {
  id: string;
  name: string;
  sig: string;
  isLive: boolean;
  isAnnounce: boolean;
  announcer: StreamerAnnouncerTypes[];
}

export interface StreamerAnnouncerTypes {
  guild_id: string;
  channel_id: string;
  role_id: string;
  message: string;
  progress: boolean;
}
