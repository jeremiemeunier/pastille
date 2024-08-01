import { getCommands } from "@functions/base";
import logs from "@functions/logs";

const bangExecute = async (message: any, guild: any, command: any) => {
  const commandDetails = await getCommands(guild, command);
  const { response, role_id } = commandDetails;

  if (role_id) {
    const user = guild.members.cache.find(
      (u: any) => u.id === message.author.id
    );
    const userRoles = user.roles.cache;

    if (userRoles.has(role_id)) {
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
