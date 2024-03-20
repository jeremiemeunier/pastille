const pollReactions = async (client, reaction, user) => {
  const userReactions = reaction.message.reactions.cache.filter((reaction) =>
    reaction.users.cache.has(user.id)
  );
  const botReactThis = reaction.users.cache.find((user) => user.bot === true);

  if (botReactThis === undefined) {
    try {
      await reaction.users.remove(user);
    } catch (error) {
      logs("error", "reaction:poll:remove", error, reaction.guildId);
      return;
    }
  } else {
    userReactions.map(async (react) => {
      if (react.emoji.name !== reaction.emoji.name) {
        try {
          await react.users.remove(user);
        } catch (error) {
          logs("error", "reaction:poll:remove_2", error, reaction.guildId);
          return;
        }
      }
    });
  }
};

export { pollReactions };
