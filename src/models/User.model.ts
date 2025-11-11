import { UserTypes } from "@/types/User.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<UserTypes>({
  discord_id: { type: String, required: true, unique: true },
  private: {
    last_login: { type: String, required: true },
    signup_date: { type: String, required: true },
  },
  personal: {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    global_name: String,
    avatar: String,
    banner: String,
    accent_color: String,
    verified: Boolean,
  },
  credentials: {
    token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    expires_in: { type: Number, required: true },
    token_type: { type: String, required: true },
  },
  guilds: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      icon: String,
      description: String,
      owner: Boolean,
      botAdded: Boolean,
    },
  ],
});

export default models.User || model("User", schema);
