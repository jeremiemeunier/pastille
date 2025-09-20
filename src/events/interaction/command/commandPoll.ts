import { readFileSync } from "node:fs";
import { EmbedBuilder } from "discord.js";
import { cwd } from "process";
import { getParams } from "@functions/base";
import Logs from "@libs/Logs";
const alphabetLetters = JSON.parse(
  readFileSync(cwd() + "/src/data/alphabet.json").toString()
);

const commandPollInit = async (_client: any, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "poll") {
    return;
  }

  const guildParams = await getParams(interaction.guild);
  const { options } = guildParams;

  let pollChoices = "";

  for (let i = 0; i < 22; i++) {
    if (
      interaction.options.getString(`choice_${alphabetLetters[i].letter}`) ===
      null
    ) {
      const embed = new EmbedBuilder({
        color: parseInt(options.color, 16),
        title: interaction.options.getString("question"),
        description: pollChoices,
      });
      const message = await interaction.reply({
        embeds: [embed],
        withResponse: true,
        content: "Nouveau sondage ! ||@here||",
      });
      for (let j = 0; j < i; j++) {
        let first = interaction.options
          .getString(`choice_${alphabetLetters[j].letter}`)
          .split(" ")[0];
        let letter = alphabetLetters[j].emoji;

        try {
          await message.react(first);
        } catch (err: any) {
          try {
            await message.react(letter);
          } catch (err: any) {
            Logs("command:poll", "error", err);
          }
        }
      }
      break;
    } else {
      pollChoices =
        pollChoices +
        `\r\n${alphabetLetters[i].emoji} ${interaction.options.getString(
          `choice_${alphabetLetters[i].letter}`
        )}`;
    }
  }
};

export { commandPollInit };
