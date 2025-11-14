import { getParams, getRules } from "@functions/Base.function";
import Logs from "@libs/Logs";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  Client,
  ChatInputCommandInteraction,
  TextChannel,
} from "discord.js";

const commandRuleInit = async ({
  client,
  interaction,
}: {
  client?: Client;
  interaction: ChatInputCommandInteraction;
}) => {
  const { commandName } = interaction;
  if (commandName !== "rule") return;

  const guildParams = await getParams({ guild: interaction?.guild! });
  if (!guildParams) return;

  const rules = await getRules({ guild: interaction?.guild! });
  if (!rules) return;

  const { options } = guildParams;
  const channel = interaction.channel as TextChannel;

  if (rules) {
    try {
      let rulesField: any[] = [];
      rules.map((item: any) => {
        rulesField.push({
          name: item.name,
          value: item.description,
          inline: false,
        });
      });

      const acceptRuleButton =
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder({
            label: "Accepter le réglement",
            style: ButtonStyle.Primary,
            custom_id: "acceptedRules",
          })
        );

      const rulesEmbed = new EmbedBuilder({
        color:
          options.color !== ""
            ? parseInt(options.color, 16)
            : parseInt("E84A95", 16),
        title: "Règles du serveur",
        description:
          "Les règles du serveur sont simples.\r\nEn utilisant ce serveur discord, l'utilisateur accepte d'emblée le réglement.\r\n\r\nIl est possible pour n'importe quel membres de signaler, un message ou utilisateur en faisant un clic droit sur celui-ci puis __Applications » Signaler__",
        fields: rulesField,
      });
      const modosEmbed = new EmbedBuilder({
        color:
          options.color !== ""
            ? parseInt(options.color, 16)
            : parseInt("E84A95", 16),
        title: "Modérations",
        description:
          "Les décisions des modérateur et de l'équipe du serveur ne sont pas discutable. Pour accompagner et faciliter le travail de la modération, un automod est présent sur ce discord.",
      });
      const updateEmbed = new EmbedBuilder({
        color:
          options.color !== ""
            ? parseInt(options.color, 16)
            : parseInt("E84A95", 16),
        description:
          "Les modérateurs ou les admins du serveur peuvent à tout moment et sans communication supplémentaire faire évoluer le réglement.",
      });

      await channel.send({
        embeds: [rulesEmbed, modosEmbed, updateEmbed],
        components: [acceptRuleButton],
      });
      interaction.reply({
        content: "Les règles ont bien été envoyé",
        flags: MessageFlags.Ephemeral,
      });
    } catch (err: any) {
      Logs({
        node: ["rule", "embed"],
        state: "error",
        content: JSON.stringify(err),
        details: interaction?.guild?.id!,
      });
      interaction.reply({
        content: "Une erreur est survenue lors de l'envoi des règles",
        flags: MessageFlags.Ephemeral,
      });
    }
  } else {
    interaction.reply({
      content: "Aucunes règles n'est disponible pour ce serveur",
      flags: MessageFlags.Ephemeral,
    });
  }
};

export { commandRuleInit };
