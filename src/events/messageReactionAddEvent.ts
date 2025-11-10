import {
  Client,
  Events,
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
} from "discord.js";
import { pollReactions } from "./interaction/reaction/reactionPoll";
import { addRole } from "./interaction/reaction/reactionRole";
import Logs from "@libs/Logs";

export const reactionAddEventInit = (client: Client) => {
  client.on(
    Events.MessageReactionAdd,
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
          Logs(["message", "reaction", "fetch"], "error", err);
          return;
        }
      }

      if (reaction.message.interaction != undefined) {
        if (reaction.message.interaction.commandName === "role") {
          addRole(client, reaction, user);
        }
        if (reaction.message.interaction.commandName === "poll") {
          pollReactions(client, reaction, user);
        }
      }
    }
  );
};
