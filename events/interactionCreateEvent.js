import { Events } from "discord.js";

import { commandPollInit } from "./interaction/command/commandPoll";
import { commandRuleInit } from "./interaction/command/commandRule";
import { commandStaffInit } from "./interaction/command/commandStaff";
import { commandAnnounceInit } from "./interaction/command/commandAnnounce";
import { commandRoleInit } from "./interaction/command/commandRole";
import { commandThreadInit } from "./interaction/command/commandThread";
import { commandStatutInit } from "./interaction/command/commandStatut";
import { commandClearInit } from "./interaction/command/commandClear";

import { buttonAcceptRuleInit } from "./interaction/button/buttonAcceptRule";
import { buttonStaffRequest } from "./interaction/button/buttonStaffRequest";
import { buttonOpenTicketInit } from "./interaction/button/buttonOpenCloseTicket";
import { contextReportUser } from "./interaction/menu/menuReportUser";
import { modalReportUser } from "./interaction/modal/modalReportUser";
import { logs } from "../function/logs";
import { contextReportMessage } from "./interaction/menu/menuReportMessage";
import { buttonDeleteMessage } from "./interaction/button/buttonDeleteMessage";

export const interactionCreateEventInit = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      //Buttons
      try {
        buttonAcceptRuleInit(client, interaction);
        buttonStaffRequest(client, interaction);
        buttonOpenTicketInit(client, interaction);
        buttonDeleteMessage(client, interaction);
      } catch (error) {
        logs("error", "interaction:button", error);
      }
    }

    if (interaction.isChatInputCommand()) {
      // Commands
      try {
        commandPollInit(client, interaction);
        commandRuleInit(client, interaction);
        commandStaffInit(client, interaction);
        commandAnnounceInit(client, interaction);
        commandRoleInit(client, interaction);
        commandThreadInit(client, interaction);
        commandStatutInit(client, interaction);
        commandClearInit(client, interaction);
      } catch (error) {
        logs("error", "interaction:slash_command", error);
      }
    }

    if (interaction.isUserContextMenuCommand()) {
      // Context user
      try {
        contextReportUser(client, interaction);
        contextReportMessage(client, interaction);
      } catch (error) {
        logs("error", "interaction:context_user", error);
      }
    }

    if (interaction.isMessageContextMenuCommand()) {
      // Context message
      try {
        contextReportMessage(client, interaction);
      } catch (error) {
        logs("error", "interaction:context_message", error);
      }
    }

    if (interaction.isModalSubmit()) {
      // Modal
      try {
        modalReportUser(client, interaction);
      } catch (error) {
        logs("error", "interaction:modal", error);
      }
    }

    return;
  });
};
