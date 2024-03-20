import { model } from "mongoose";

const user = model("User", {
  discord_id: String,
  password: String,
  mail_adress: String,
  token: String,
  sign_date: String,
});

export default user;
