import { Events } from "discord.js";
import { logs } from "../function/logs";
import { removeRole } from "./interaction/reaction/reactionRole";

export const reactionRemoveEventInit = (client) => {
  client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot === true) {
      return;
    }
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        logs("error", "reaction:remove:fetch", error);
        return;
      }
    }

    if (reaction.message.interaction != undefined) {
      if (reaction.message.interaction.commandName === "role") {
        removeRole(client, reaction, user);
      }
    }
  });
};
