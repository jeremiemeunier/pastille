import { SessionTypes } from "@/types/Session.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<SessionTypes>({
  user_id: { type: String, required: true, index: true },
  token: { type: String, required: true, unique: true },
  refresh_token: { type: String, required: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
  ip_address: String,
  user_agent: String,
});

// TTL index for automatic cleanup of expired sessions
schema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default models.Session || model("Session", schema);
