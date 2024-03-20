import { model } from "mongoose";

const role = model("Role", {
  guild_id: String,
  name: String,
  emote: String,
  role: String,
  description: String,
});

export default role;
