const { getCommands } = require("../../../function/base");
const { logs } = require("../../../function/logs");

const bangExecute = async (message, guild, command) => {
  const commandDetails = await getCommands(guild, command);
  const { response } = commandDetails;

  try {
    await message.reply({ content: response });
  }
  catch(error) { logs("error", "bang:personal_command:send", error, guild.id); }
}

module.exports = { bangExecute }