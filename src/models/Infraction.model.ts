import { InfractionTypes } from "@/types/Infraction.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<InfractionTypes>({
  user_id: String,
  guild_id: String,
  warn: {
    reason: String,
    date: String,
  },
});

export default models.Infraction || model("Infraction", schema);
