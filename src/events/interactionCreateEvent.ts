import { Client, Events, Interaction } from "discord.js";

import { commandPollInit } from "./interaction/command/commandPoll";
import { commandRuleInit } from "./interaction/command/commandRule";
import { commandAnnounceInit } from "./interaction/command/commandAnnounce";
import { commandRoleInit } from "./interaction/command/commandRole";
import { commandThreadInit } from "./interaction/command/commandThread";
import { commandStatutInit } from "./interaction/command/commandStatut";
import { commandClearInit } from "./interaction/command/commandClear";
import { commandStaffInit } from "./interaction/command/commandStaff";

import { buttonAcceptRuleInit } from "./interaction/button/buttonAcceptRule";
import { buttonStaffRequest } from "./interaction/button/buttonStaffRequest";
import { buttonOpenTicketInit } from "./interaction/button/buttonOpenCloseTicket";
import { contextReportUser } from "./interaction/menu/menuReportUser";
import { modalReportUser } from "./interaction/modal/modalReportUser";
import { contextReportMessage } from "./interaction/menu/menuReportMessage";
import { buttonDeleteMessage } from "./interaction/button/buttonDeleteMessage";
import Logs from "@libs/Logs";
import { commandJusticeInit } from "./interaction/command/commandJustice";

export const interactionCreateEventInit = (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isButton()) {
      //Buttons
      try {
        buttonAcceptRuleInit({ client, interaction });
        buttonStaffRequest({ client, interaction });
        buttonOpenTicketInit({ client, interaction });
        buttonDeleteMessage({ client, interaction });
      } catch (err: any) {
        Logs(["interaction", "button"], "error", err);
      }
    }

    if (interaction.isChatInputCommand()) {
      // Commands
      try {
        commandPollInit({ client, interaction });
        commandRuleInit({ client, interaction });
        commandStaffInit({ client, interaction });
        commandAnnounceInit({ client, interaction });
        commandRoleInit({ client, interaction });
        commandThreadInit({ client, interaction });
        commandStatutInit({ client, interaction });
        commandClearInit({ client, interaction });
        commandJusticeInit({ client, interaction });
      } catch (err: any) {
        Logs(["interaction", "slash_command"], "error", err);
      }
    }

    if (interaction.isUserContextMenuCommand()) {
      // Context user
      try {
        contextReportUser({ client, interaction });
        contextReportMessage({ client, interaction });
      } catch (err: any) {
        Logs(["interaction", "context_user"], "error", err);
      }
    }

    if (interaction.isMessageContextMenuCommand()) {
      // Context message
      try {
        contextReportMessage({ client, interaction });
      } catch (err: any) {
        Logs(["interaction", "context_message"], "error", err);
      }
    }

    if (interaction.isModalSubmit()) {
      // Modal
      try {
        modalReportUser({ client, interaction });
      } catch (err: any) {
        Logs(["interaction", "modal"], "error", err);
      }
    }

    return;
  });
};
