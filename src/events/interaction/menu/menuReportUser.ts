import Logs from "@libs/Logs";
import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

const contextReportUser = async (client: any, interaction: any) => {
  const { commandName } = interaction;
  if (commandName !== "Signaler") {
    return;
  }

  const guild = client.guilds.cache.find(
    (guild: { id: any }) => guild?.id === interaction.commandGuildId
  );

  const reportModal: any = new ModalBuilder({
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
  } catch (err: any) {
    Logs(["command", "report", "showmodal"], "error", err, guild?.id);
  }
};

export { contextReportUser };
