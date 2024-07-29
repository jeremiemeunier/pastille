import { UserTypes } from "@/types/User.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<UserTypes>({
  discord_id: String,
  password: String,
  mail_adress: String,
  token: String,
  sign_date: String,
});

export default models.User || model("User", schema);
