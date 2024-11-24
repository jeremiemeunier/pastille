import pkg from "mongoose";
import { RoleTypes } from "@/types/Role.types";

const { Schema, model, models } = pkg;

const schema = new Schema<RoleTypes>({
  guild_id: String,
  name: String,
  emote: String,
  role: String,
  description: String,
});

export default models.Role || model("Role", schema);
