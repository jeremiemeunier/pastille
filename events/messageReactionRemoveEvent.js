const { Events } = require("discord.js");
const { logs } = require("../function/logs");
const { removeRole } = require("./interaction/reaction/reactionRole");

const reactionRemoveEventInit = (client) => {
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

module.exports = { reactionRemoveEventInit };
