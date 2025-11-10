import { CommandTypes } from "@/types/Command.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<CommandTypes>({
  guild_id: String,
  role_id: String,
  terms: String,
  response: String,
});

export default models.Command || model("Command", schema);
