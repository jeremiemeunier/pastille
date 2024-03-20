import { model } from "mongoose";

const dailyui = model("DailyUi", {
  guild_id: String,
  available: Boolean,
  title: String,
  description: String,
});

export default dailyui;
