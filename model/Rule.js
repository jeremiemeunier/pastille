import { model } from "mongoose";

const rule = model("Rule", {
  guild_id: String,
  name: String,
  description: String,
  active: Boolean,
});

export default rule;
