import { model } from "mongoose";

const emote = model("Emote", {
  letter: String,
  emote: String,
});

export default emote;
