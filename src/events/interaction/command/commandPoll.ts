import { readFileSync } from "node:fs";
import { ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import { cwd } from "process";
import { getParams } from "@functions/Base.function";
import Logs from "@libs/Logs";
const alphabetLetters = JSON.parse(
  readFileSync(cwd() + "/src/data/alphabet.json").toString()
);

const commandPollInit = async ({
  client,
  interaction,
}: {
  client?: Client;
  interaction: ChatInputCommandInteraction;
}) => {
  const { commandName } = interaction;

  if (commandName !== "poll") return;
  if (!interaction.guild) return;

  const guildParams = await getParams({ guild: interaction?.guild });
  if (!guildParams) return;

  const { options } = guildParams;

  let pollChoices = "";

  for (let i = 0; i < 22; i++) {
    if (
      interaction.options.getString(`choice_${alphabetLetters[i].letter}`) ===
      null
    ) {
      const embed = new EmbedBuilder({
        color:
          options.color !== ""
            ? parseInt(options.color, 16)
            : parseInt("E84A95", 16),
        title: interaction.options.getString("question")!,
        description: pollChoices,
      });
      const response = await interaction.reply({
        embeds: [embed],
        withResponse: true,
        content: "Nouveau sondage ! ||@here||",
      });
      for (let j = 0; j < i; j++) {
        let first = interaction
          .options!.getString(`choice_${alphabetLetters[j].letter}`)!
          .split(" ")[0];
        let letter = alphabetLetters[j].emoji;

        try {
          await response.resource!.message!.react(first);
        } catch (err: any) {
          try {
            await response.resource!.message!.react(letter);
          } catch (err: any) {
            Logs({ node: ["command", "poll"], state: "error", content: err });
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
