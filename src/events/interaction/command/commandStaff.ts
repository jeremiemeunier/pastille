import { getParams } from "@functions/base";
import Logs from "@libs/Logs";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

const commandStaffInit = async (_client: any, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "staff") {
    return;
  }

  const guildParams = await getParams({ guild: interaction?.guildId });
  if (!guildParams) return;

  const { options } = guildParams;

  try {
    const requestStaffButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder({
        label: "Contacter le staff",
        style: ButtonStyle.Primary,
        custom_id: "requestStaff",
      })
    );
    const embed = new EmbedBuilder({
      color:
        options.color !== ""
          ? parseInt(options.color, 16)
          : parseInt("E84A95", 16),
      title: "Demande de support",
      description:
        "Comment pouvons-nous t'aider ? Si tu as des questions ou des demandes clique sur le bouton pour contacter le staff",
    });
    const message = await interaction.reply({
      embeds: [embed],
      components: [requestStaffButton],
      withResponse: false,
    });
  } catch (err: any) {
    Logs("command:staff", "error", err, interaction?.guildId);
  }
};

export { commandStaffInit };
