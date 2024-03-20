import { model } from "mongoose";

const infraction = model("Infraction", {
  user_id: String,
  guild_id: String,
  warn: {
    reason: String,
    date: String,
  },
});

export default infraction;
