import { model } from "mongoose";

const command = model("Command", {
  guild_id: String,
  terms: String,
  response: String,
});

export default command;
