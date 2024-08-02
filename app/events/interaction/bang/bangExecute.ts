import { getCommands } from "@functions/base";
import logs from "@functions/logs";

const bangExecute = async (message: any, guild: any, command: any) => {
  const commandDetails = await getCommands(guild, command);
  const { response, role_id, channel_id } = commandDetails;

  // check if a channel or/and a role is defined to lock command

  if (role_id || channel_id) {
    const user = guild.members.cache.find(
      (u: any) => u.id === message.author.id
    );
    const userRoles = user.roles.cache;

    const params = {
      role: userRoles.has(role_id),
      channel: message.channelId === channel_id,
    };

    if (role_id && channel_id && params.role && params.channel) {
      try {
        await message.reply({ content: response });
      } catch (error: any) {
        logs("error", "bang:guild:cmd:send", error, guild.id);
      }
    } else if (!channel_id && role_id && params.role) {
      try {
        await message.reply({ content: response });
      } catch (error: any) {
        logs("error", "bang:guild:cmd:send", error, guild.id);
      }
    } else if (!role_id && channel_id && params.channel) {
      try {
        await message.reply({ content: response });
      } catch (error: any) {
        logs("error", "bang:guild:cmd:send", error, guild.id);
      }
    }
  } else {
    try {
      await message.reply({ content: response });
    } catch (error: any) {
      logs("error", "bang:guild:cmd:send", error, guild.id);
    }
  }
};

export { bangExecute };
