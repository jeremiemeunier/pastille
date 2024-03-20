import { model } from "mongoose";

const streamer = model("Streamer", {
  guild_id: String,
  twitch: {
    id: String,
    name: String,
  },
  message: String,
  progress: Boolean,
});

export default streamer;
