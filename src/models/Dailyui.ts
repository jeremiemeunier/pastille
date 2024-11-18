import pkg from "mongoose";
import { DailyUiTypes } from "@/types/Dailyui.types";

const { Schema, model, models } = pkg;

const schema = new Schema<DailyUiTypes>({
  guild_id: String,
  available: Boolean,
  title: String,
  description: String,
});

export default models.DailyUi || model("DailyUi", schema);
