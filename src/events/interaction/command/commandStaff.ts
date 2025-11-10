import { getParams } from "@functions/Base.function";
import Logs from "@libs/Logs";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ChatInputCommandInteraction,
} from "discord.js";

const commandStaffInit = async ({
  client,
  interaction,
}: {
  client?: Client;
  interaction: ChatInputCommandInteraction;
}) => {
  const { commandName } = interaction;
  if (commandName !== "staff") return;

  const guildParams = await getParams({ guild: interaction?.guild! });
  if (!guildParams) return;

  const { options } = guildParams;

  try {
    const requestStaffButton =
      new ActionRowBuilder<ButtonBuilder>().addComponents(
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
    Logs(["command", "staff"], "error", err, interaction?.guild!.id!);
  }
};

export { commandStaffInit };
