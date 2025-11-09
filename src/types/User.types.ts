export interface UserTypes {
  _id?: string;
  discord_id: string;
  private: {
    last_login: string;
    signup_date: string;
  };
  personal: {
    email: string;
    username: string;
    global_name: string;
    avatar?: string;
    banner?: string;
    accent_color?: string;
    verified: boolean;
  };
  credentials: {
    token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
  guilds: Array<{
    id: string;
    name: string;
    icon?: string;
    description?: string;
    owner: boolean;
  }>;
}
