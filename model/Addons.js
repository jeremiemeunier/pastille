import { model } from "mongoose";

const addons = model("Addons", {
  guild_id: String,
  name: String,
  active: Boolean,
  channel: String,
  params: {},
  role: String,
});

export default addons;
