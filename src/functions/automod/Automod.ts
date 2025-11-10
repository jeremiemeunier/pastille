import { Guild } from "discord.js";
import { automodVerifier } from "./automodVerifer";

const AutomodDaemon = async (guild: Guild) => {
  automodVerifier(guild);
};

export default AutomodDaemon;
