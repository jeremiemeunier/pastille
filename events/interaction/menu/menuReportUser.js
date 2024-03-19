const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const { logs } = require("../../../function/logs");

const contextReportUser = async (client, interaction) => {
  const { commandName } = interaction;
  if (commandName !== "Signaler") {
    return;
  }

  const guild = client.guilds.cache.find(
    (guild) => guild.id === interaction.commandGuildId
  );

  const reportModal = new ModalBuilder({
    custom_id: "modalReportUser",
    title: "Signalement d'un utilisateur",
  });

  const reportField = new TextInputBuilder({
    custom_id: "reportedUser",
    style: TextInputStyle.Short,
    label: "Id de l'utilisateur",
    value: interaction.targetId,
    required: true,
  });
  const reportFieldComponents = new ActionRowBuilder().addComponents(
    reportField
  );

  const reasonField = new TextInputBuilder({
    custom_id: "shortReportReason",
    style: TextInputStyle.Short,
    label: "Une courte explication",
    required: true,
  });
  const reasonFieldComponents = new ActionRowBuilder().addComponents(
    reasonField
  );

  const descriptionField = new TextInputBuilder({
    custom_id: "largeReportReason",
    style: TextInputStyle.Paragraph,
    label: "Un peu plus de détails",
    max_length: 2000,
    required: false,
  });
  const descriptionFieldComponents = new ActionRowBuilder().addComponents(
    descriptionField
  );

  try {
    reportModal.addComponents(
      reportFieldComponents,
      reasonFieldComponents,
      descriptionFieldComponents
    );
    await interaction.showModal(reportModal);
  } catch (error) {
    logs("error", "command:report:showmodal", error, guild.id);
  }
};

module.exports = { contextReportUser };
