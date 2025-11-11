import { RuleTypes } from "@/types/Rule.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<RuleTypes>({
  guild_id: String,
  name: String,
  description: String,
  active: Boolean,
});

export default models.Rule || model("Rule", schema);
