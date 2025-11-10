import { Events, Message } from "discord.js";
import { bangRule } from "./interaction/bang/bangRule";
import { bangStatus } from "./interaction/bang/bangStatus";
import { bangExecute } from "./interaction/bang/bangExecute";
import {
  dateParser,
  getCommands,
  getParams,
  hoursParser,
} from "@functions/Base.function";
import {
  buildConversationContext,
  removeMentions,
} from "@functions/messageContext";
import Logs from "@libs/Logs";
import axios from "axios";

export const messageCreateEventInit = (client: any) => {
  client.on(Events.MessageCreate, async (message: Message) => {
    const content = message.content;
    const guild = client.guilds.cache.find(
      (guild: { id: any }) => guild?.id === message.guildId
    );
    const channel = guild.channels.cache.find(
      (channel: { id: any }) => channel?.id === message.channelId
    );

    const guildParams = await getParams({ guild: guild.id });
    if (!guildParams) return;

    const { options } = guildParams;

    const splitedMsg = content.split(" ");
    const cmd = splitedMsg?.shift()?.slice(1);

    if (message.author.bot === true) return;

    if (options.bang && content.startsWith(options.bang)) {
      const guildCommands = await getCommands({ guild: guild.id });

      if (cmd === "regles") {
        bangRule(message, guild);
        return;
      }
      if (cmd === "status") {
        bangStatus(message, guild);
        return;
      }

      if (guildCommands) {
        guildCommands.map(async (item: { _id: any; terms: any }) => {
          const { _id, terms } = item;
          if (cmd === terms) {
            await bangExecute(message, guild, _id);
          }
        });
      }
    }

    if (channel.name === options.channels.screenshots) {
      if (message.attachments.size) {
        try {
          const title = `${
            message.author.globalName
          } (${await dateParser()} ${await hoursParser()})`;
          const thread = await message.startThread({
            name: title,
            autoArchiveDuration: 4320,
            reason: "New screenshots posted",
          });
        } catch (err: any) {
          Logs(["thread", "screenshots"], "error", err);
          return;
        }
      } else {
        try {
          await message.delete();
          await message.author.send(
            "Tu es sur un channel dédié aux screenshots. Afin de garder de la clarté dans la lecture, tu peux commenter les posts des autres membres directement dans les fils liés."
          );
        } catch (err: any) {
          Logs(["delete", "message", "screenshots"], "error", err);
          return;
        }
      }
    }

    if (message.mentions.has(client.user)) {
      if (message.mentions.everyone) return;

      try {
        // Build conversation context from reply chain
        const conversationHistory = await buildConversationContext(
          message,
          client.user.id
        );

        // Prepare messages array with system message, conversation history, and current message
        const messages = [
          {
            role: "system",
            content: `Répond de manière sarcastique et rigolote au message de cet utilisateur, il se nomme ${message.author.displayName}. Tu es pastille un bot exceptionnel qui ne se laisse pas marcher sur les pieds. Tu te prénomme Pastille. N'utilise jamais le nom de l'utilisateur comme étant le tient tu vaut mieux que ça. Si l'utilisateur te pose des questions et faits des fautes n'hésite pas à la reprendre en précédant ta correction de l'émoji suivant : 🤓. Tu peux d'ailleurs utiliser des emoji et du texte enrichie avec MarkDown pour répondre aux questions.`,
          },
          ...conversationHistory,
          {
            role: "user",
            content: removeMentions(message.content),
          },
        ];

        const req = await axios.post(
          "https://ollama.jeremiemeunier.fr/api/chat/",
          {
            model: "gemma3",
            messages,
            stream: false,
            options: {
              num_predict: 400,
            },
          }
        );

        if (req.data.message) {
          try {
            await message.reply({ content: req.data.message.content });
          } catch (err: any) {
            Logs(["message", "event", "ai", "reply"], "error", err);
          }
        }
      } catch (err: any) {
        Logs(["message", "event", "ai"], "error", err);
      }
    }

    return;
  });
};
