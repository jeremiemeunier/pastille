import { GuildsTypes } from "@/types/Guild.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<GuildsTypes>(
  {
    id: { type: String, required: true, unique: true },
    data: { type: Object, required: true },
  },
  { timestamps: true }
);

export default models.Guild || model("guild", schema);
