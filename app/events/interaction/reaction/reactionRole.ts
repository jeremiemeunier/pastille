import { getRoles } from "@functions/base";
import logs from "@functions/logs";
import { Events } from "discord.js";

const addRole = async (
  client: {
    on?: (
      arg0: Events,
      arg1: (reaction: any, user: any) => Promise<void>
    ) => void;
    guilds?: any;
  },
  reaction: { partial?: any; fetch?: () => any; message: any; emoji?: any },
  user: { bot?: boolean; id?: any }
) => {
  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild.id === reaction.message.guildId
  );
  const member = guild.members.cache.find(
    (member: { id: any }) => member.id === user.id
  );

  const roles = await getRoles({ guild: guild });

  roles.map(async (item: { role?: any; emote?: any }) => {
    const { emote } = item;

    if (reaction.emoji.name === emote) {
      const roleItem = guild.roles.cache.find(
        (role: { id: any }) => role.id === item.role
      );

      try {
        await member.roles.add(roleItem);
      } catch (error: any) {
        logs("error", "reaction:role:add", error, reaction.message.guildId);
        return;
      }
    }
  });
};

const removeRole = async (
  client: {
    on?: (
      arg0: Events,
      arg1: (reaction: any, user: any) => Promise<void>
    ) => void;
    guilds?: any;
  },
  reaction: { partial?: any; fetch?: () => any; message: any; emoji?: any },
  user: { bot?: boolean; id?: any }
) => {
  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild.id === reaction.message.guildId
  );
  const member = guild.members.cache.find(
    (member: { id: any }) => member.id === user.id
  );

  const roles = await getRoles({ guild: guild });

  roles.map(async (item: { role?: any; emote?: any }) => {
    const { emote } = item;

    if (reaction.emoji.name === emote) {
      const roleItem = guild.roles.cache.find(
        (role: { id: any }) => role.id === item.role
      );

      try {
        await member.roles.remove(roleItem);
      } catch (error: any) {
        logs("error", "reaction:role:remove", error, reaction.message.guildId);
        return;
      }
    }
  });
};

export { addRole, removeRole };
