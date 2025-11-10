import { SanctionTypes } from "@/types/Sanction.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<SanctionTypes>({
  user_id: String,
  guild_id: String,
  sanction: {
    level: String,
    date: String,
    ending: String,
  },
  checkable: Boolean,
});

export default models.Sanction || model("Sanction", schema);
