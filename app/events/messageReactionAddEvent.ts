import { Events } from "discord.js";
import { pollReactions } from "./interaction/reaction/reactionPoll";
import logs from "@functions/logs";
import { addRole } from "./interaction/reaction/reactionRole";

export const reactionAddEventInit = (client: {
  on: (arg0: Events, arg1: (reaction: any, user: any) => Promise<void>) => void;
}) => {
  client.on(
    Events.MessageReactionAdd,
    async (
      reaction: {
        partial: any;
        fetch: () => any;
        message: { interaction: { commandName: string } | undefined };
      },
      user: { bot: boolean }
    ) => {
      if (user.bot === true) {
        return;
      }
      if (reaction.partial) {
        try {
          await reaction.fetch();
        } catch (error: any) {
          logs("error", `An error occured on fetch`, error);
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