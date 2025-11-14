import {
  Client,
  Events,
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
} from "discord.js";
import { removeRole } from "./interaction/reaction/reactionRole";
import Logs from "@libs/Logs";

export const reactionRemoveEventInit = (client: Client) => {
  client.on(
    Events.MessageReactionRemove,
    async (
      reaction: MessageReaction | PartialMessageReaction,
      user: User | PartialUser
    ) => {
      if (user.bot === true) {
        return;
      }
      if (reaction.partial) {
        try {
          await reaction.fetch();
        } catch (err: any) {
          Logs({
            node: ["reaction", "remove", "fetch"],
            state: "error",
            content: err,
          });
          return;
        }
      }

      if (reaction.message.interaction != undefined) {
        if (reaction.message.interaction.commandName === "role") {
          removeRole(client, reaction, user);
        }
      }
    }
  );
};
