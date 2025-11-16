import { SettingTypes } from "@/types/Setting.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<SettingTypes>({
  // Note: unique constraint added to prevent duplicate settings per guild
  // Ensure no duplicate guild_id entries exist before deploying this change
  // Run: db.settings.aggregate([{$group: {_id: "$guild_id", count: {$sum: 1}}}, {$match: {count: {$gt: 1}}}])
  guild_id: { type: String, required: true, unique: true },
  premium: { type: Boolean, default: false },
  premium_end: { type: String, default: "" },
  options: {
    bang: { type: String, default: "" },
    color: { type: String, default: "" },
    channels: {
      announce: { type: String, default: "" },
      help: { type: String, default: "" },
      voiceText: { type: String, default: "" },
      screenshots: { type: String, default: "" },
    },
  },
  moderation: {
    sharing: { type: Boolean, default: true },
    channels: {
      alert: { type: String, default: "" },
      report: { type: String, default: "" },
      automod: { type: String, default: "" },
      shared: { type: String, default: "" },
    },
    limit: {
      emoji: { type: Number, default: 0 },
      mention: { type: Number, default: 0 },
      link: { type: Number, default: 0 },
      invite: { type: Number, default: 0 },
    },
    imune: { type: Array, default: [] },
    roles: {
      muted: { type: String, default: "" },
      rule: { type: String, default: "" },
      staff: { type: String, default: "" },
    },
    sanctions: {
      low: {
        duration: { type: Number, default: 0 },
        unit: { type: String, default: "" },
      },
      medium: {
        duration: { type: Number, default: 0 },
        unit: { type: String, default: "" },
      },
      hight: {
        duration: { type: Number, default: 0 },
        unit: { type: String, default: "" },
      },
    },
  },
});

export default models.Setting || model("Setting", schema);
