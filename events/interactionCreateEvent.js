const { Events } = require("discord.js");

const { commandPollInit } = require("./interaction/command/commandPoll");
const { commandRuleInit } = require("./interaction/command/commandRule");
const { commandStaffInit } = require("./interaction/command/commandStaff");
const {
  commandAnnounceInit,
} = require("./interaction/command/commandAnnounce");
const { commandRoleInit } = require("./interaction/command/commandRole");
const { commandThreadInit } = require("./interaction/command/commandThread");
const { commandStatutInit } = require("./interaction/command/commandStatut");
const { commandClearInit } = require("./interaction/command/commandClear");

const {
  buttonAcceptRuleInit,
} = require("./interaction/button/buttonAcceptRule");
const {
  buttonStaffRequest,
} = require("./interaction/button/buttonStaffRequest");
const {
  buttonOpenTicketInit,
} = require("./interaction/button/buttonOpenCloseTicket");
const { contextReportUser } = require("./interaction/menu/menuReportUser");
const { modalReportUser } = require("./interaction/modal/modalReportUser");
const { logs } = require("../function/logs");
const {
  contextReportMessage,
} = require("./interaction/menu/menuReportMessage");
const {
  buttonDeleteMessage,
} = require("./interaction/button/buttonDeleteMessage");

const interactionCreateEventInit = (client) => {
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

module.exports = { interactionCreateEventInit };
