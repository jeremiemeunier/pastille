import { TwitchTypes } from "@/types/Twitch.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<TwitchTypes>({
  guild_id: String,
  twitch: {
    id: String,
    name: String,
  },
  message: String,
  progress: Boolean,
});

export default models.Streamer || model("Streamer", schema);
