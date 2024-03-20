import { model } from "mongoose";

const sanction = model("Sanction", {
  user_id: String,
  guild_id: String,
  sanction: {
    level: String,
    date: String,
    ending: String,
  },
  checkable: Boolean,
});

export default sanction;
