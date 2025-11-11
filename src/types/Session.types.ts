export interface SessionTypes {
  _id?: string;
  user_id: string;
  token: string;
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
  ip_address?: string;
  user_agent?: string;
}
