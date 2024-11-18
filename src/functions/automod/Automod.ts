import { automodVerifier } from "./automodVerifer";

const AutomodDaemon = async (guild: any) => {
  automodVerifier(guild);
};

export default AutomodDaemon;
