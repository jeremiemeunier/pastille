import { getParams, getRoles } from "@functions/Base.function";
import Logs from "@libs/Logs";
import { ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";

const commandRoleInit = async ({
  client,
  interaction,
}: {
  client?: Client;
  interaction: ChatInputCommandInteraction;
}) => {
  const { commandName } = interaction;
  if (commandName !== "role") return;

  const guildParams = await getParams({ guild: interaction?.guild! });
  if (!guildParams) return;

  const { options } = guildParams;
  const roles = await getRoles({ guild: interaction?.guild! });
  if (!roles) return;

  const fields: any[] = [];
  roles.map((item: any) => {
    fields.push({
      name: `${item.emote} — ${item.name}`,
      value: item.description,
      inline: true,
    });
  });

  const embed = new EmbedBuilder({
    color:
      options.color !== ""
        ? parseInt(options.color, 16)
        : parseInt("E84A95", 16),
    title: "Pastille autorole",
    description:
      "Clique sur les réactions en dessous de ce message pour t'ajouter les rôles en fonction de tes centres d'intérêt.",
    fields: fields,
  });
  try {
    const response = await interaction.reply({
      embeds: [embed],
      withResponse: true,
    });

    roles.map(async (item: any) => {
      try {
        await response.resource!.message!.react(item.emote);
      } catch (err: any) {
        Logs({
          node: ["command", "role", "react"],
          state: "error",
          content: err,
          details: interaction?.guild!.id!,
        });
      }
    });
  } catch (err: any) {
    Logs({
      node: ["command", "role", "send"],
      state: "error",
      content: err,
      details: interaction?.guild!.id!,
    });
  }
};

export { commandRoleInit };
