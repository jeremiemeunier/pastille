import { getParams, getRules } from "@functions/base";
import Logs from "@libs/Logs";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";

const commandRuleInit = async (_client: any, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "rule") {
    return;
  }

  const rules = await getRules({ guild: interaction?.guild });
  const guildParams = await getParams({ guild: interaction?.guild });
  const { options } = guildParams;
  const channel = interaction.channel;

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

      const acceptRuleButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder({
          label: "Accepter le réglement",
          style: ButtonStyle.Primary,
          custom_id: "acceptedRules",
        })
      );

      const rulesEmbed = new EmbedBuilder({
        color: parseInt(options.color, 16),
        title: "Règles du serveur",
        description:
          "Les règles du serveur sont simples.\r\nEn utilisant ce serveur discord, l'utilisateur accepte d'emblée le réglement.\r\n\r\nIl est possible pour n'importe quel membres de signaler, un message ou utilisateur en faisant un clic droit sur celui-ci puis __Applications » Signaler__",
        fields: rulesField,
      });
      const modosEmbed = new EmbedBuilder({
        color: parseInt(options.color, 16),
        title: "Modérations",
        description:
          "Les décisions des modérateur et de l'équipe du serveur ne sont pas discutable. Pour accompagner et faciliter le travail de la modération, un automod est présent sur ce discord.",
      });
      const updateEmbed = new EmbedBuilder({
        color: parseInt(options.color, 16),
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
      Logs("rule:embed", "error", JSON.stringify(err), interaction?.guild?.id);
      console.log(err);
    }
  } else {
    interaction.reply({
      content: "Aucunes règles n'est disponible pour ce serveur",
      flags: MessageFlags.Ephemeral,
    });
  }
};

export { commandRuleInit };
