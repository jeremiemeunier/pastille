export interface SettingTypes {
  guild_id: string;
  premium: boolean;
  premium_end: string;
  options: {
    bang: string;
    color: string;
    channels: {
      announce: string;
      help: string;
      voiceText: string;
      screenshots: string;
    };
  };
  moderation: {
    sharing: boolean;
    channels: {
      alert: string;
      report: string;
      automod: string;
    };
    limit: {
      emoji: number;
      mention: number;
      link: number;
      invite: number;
    };
    imune: string[];
    roles: {
      muted: string;
      rule: string;
      staff: string;
    };
    sanctions: {
      low: {
        duration: number;
        unit: string;
      };
      medium: {
        duration: number;
        unit: string;
      };
      hight: {
        duration: number;
        unit: string;
      };
    };
  };
}
