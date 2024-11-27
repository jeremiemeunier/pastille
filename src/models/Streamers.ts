import { StreamerTypes } from "@/types/Streamers.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<StreamerTypes>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  sig: { type: String, required: true },
  isLive: { type: Boolean, required: true, default: false },
  isAnnounce: { type: Boolean, required: true, default: false },
  isValid: { type: Boolean, required: true, default: false },
  announcer: [],
});

export default models.Streaming || model("Streaming", schema);
