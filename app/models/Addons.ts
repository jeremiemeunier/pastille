import { AddonsTypes } from "@/types/Addons.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<AddonsTypes>({
  guild_id: String,
  name: String,
  active: Boolean,
  channel: String,
  params: {},
  role: String,
});

export default models.Addon || model("Addon", schema);
