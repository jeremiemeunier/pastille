import Logs from "@libs/Logs";
import { Client } from "discord.js";

const pollReactions = async (
  client: Client,
  reaction: {
    partial?: any;
    fetch?: () => any;
    message: any;
    users?: any;
    guildId?: any;
    emoji?: any;
  },
  user: { bot?: boolean; id?: any }
) => {
  const userReactions = reaction.message.reactions.cache.filter(
    (reaction: { users: { cache: { has: (arg0: any) => any } } }) =>
      reaction.users.cache.has(user?.id)
  );
  const botReactThis = reaction.users.cache.find(
    (user: { bot: boolean }) => user.bot === true
  );

  if (botReactThis === undefined) {
    try {
      await reaction.users.remove(user);
    } catch (err: any) {
      Logs({
        node: ["reaction", "poll", "remove"],
        state: "error",
        content: err,
        details: reaction.guildId,
      });
      return;
    }
  } else {
    userReactions.map(
      async (react: {
        emoji: { name: any };
        users: { remove: (arg0: any) => any };
      }) => {
        if (react.emoji.name !== reaction.emoji.name) {
          try {
            await react.users.remove(user);
          } catch (err: any) {
            Logs({
              node: ["reaction", "poll", "remove_2"],
              state: "error",
              content: err,
              details: reaction.guildId,
            });
            return;
          }
        }
      }
    );
  }
};

export { pollReactions };
