export interface SanctionTypes {
  _id?: string;
  user_id: string;
  guild_id: string;
  sanction: {
    level: string;
    date: string;
    ending: string;
  };
  checkable: boolean;
}
