import { EmoteTypes } from "@/types/Emote.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<EmoteTypes>({
  letter: String,
  emote: String,
});

export default models.Emote || model("Emote", schema);
