import { getRoles } from "@functions/Base.function";
import Logs from "@libs/Logs";
import {
  Client,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";

const addRole = async (
  client: Client,
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
) => {
  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild?.id === reaction.message.guildId
  );
  if (!guild) return;

  const member = guild.members.cache.find(
    (member: { id: any }) => member?.id === user?.id
  );
  if (!member) return;

  const roles = await getRoles({ guild: guild });

  roles.map(async (item: { role?: any; emote?: any }) => {
    const { emote } = item;

    if (reaction.emoji.name === emote) {
      const roleItem = guild.roles.cache.find(
        (role: { id: any }) => role?.id === item.role
      );
      if (!roleItem) return;

      try {
        await member.roles.add(roleItem);
      } catch (err: any) {
        Logs(
          ["reaction", "role", "add"],
          "error",
          err,
          reaction.message.guild!.id
        );
        return;
      }
    }
  });
};

const removeRole = async (
  client: Client,
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
) => {
  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild?.id === reaction.message.guildId
  );
  if (!guild) return;

  const member = guild.members.cache.find(
    (member: { id: any }) => member?.id === user?.id
  );
  if (!member) return;

  const roles = await getRoles({ guild: guild });

  roles.map(async (item: { role?: any; emote?: any }) => {
    const { emote } = item;

    if (reaction.emoji.name === emote) {
      const roleItem = guild.roles.cache.find(
        (role: { id: any }) => role?.id === item.role
      );
      if (!roleItem) return;

      try {
        await member.roles.remove(roleItem);
      } catch (err: any) {
        Logs(
          ["reaction", "role", "remove"],
          "error",
          err,
          reaction.message.guild!.id
        );
        return;
      }
    }
  });
};

export { addRole, removeRole };
