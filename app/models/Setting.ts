import { SettingTypes } from "@/types/Setting.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<SettingTypes>({
  guild_id: String,
  premium: Boolean,
  premium_end: String,
  options: {
    bang: String,
    color: String,
    channels: {
      announce: String,
      help: String,
      voiceText: String,
      screenshots: String,
    },
  },
  moderation: {
    sharing: Boolean,
    channels: {
      alert: String,
      report: String,
      automod: String,
    },
    limit: {
      emoji: Number,
      mention: Number,
      link: Number,
      invite: Number,
    },
    imune: Array,
    roles: {
      muted: String,
      rule: String,
      staff: String,
    },
    sanctions: {
      low: {
        duration: Number,
        unit: String,
      },
      medium: {
        duration: Number,
        unit: String,
      },
      hight: {
        duration: Number,
        unit: String,
      },
    },
  },
});

export default models.Setting || model("Setting", schema);
