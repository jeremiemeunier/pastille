import { GuildsTypes } from "@/types/Guild.types";
import pkg from "mongoose";

const { Schema, model, models } = pkg;

const schema = new Schema<GuildsTypes>();

export default models.Guild || model("Guild", schema);
