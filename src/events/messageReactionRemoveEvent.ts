import { Events } from "discord.js";
import { removeRole } from "./interaction/reaction/reactionRole";
import Logs from "@libs/Logs";

export const reactionRemoveEventInit = (client: {
  on: (arg0: Events, arg1: (reaction: any, user: any) => Promise<void>) => void;
}) => {
  client.on(
    Events.MessageReactionRemove,
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
          Logs("reaction:remove:fetch", "error", error);
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
