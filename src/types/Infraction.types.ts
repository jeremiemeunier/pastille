export interface InfractionTypes {
  _id?: string;
  user_id: string;
  guild_id: string;
  warn: {
    reason: string;
    date: string;
  };
}
