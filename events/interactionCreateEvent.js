const { commandPollInit } = require('./interaction/command/commandPoll');
const { commandRuleInit } = require('./interaction/command/commandRule');
const { commandStaffInit } = require('./interaction/command/commandStaff');
const { commandAnnounceInit } = require('./interaction/command/commandAnnounce');
const { commandRoleInit } = require('./interaction/command/commandRole');
const { commandThreadInit } = require('./interaction/command/commandThread');
const { commandStatutInit } = require('./interaction/command/commandStatut');
const { commandClearInit } = require('./interaction/command/commandClear');

const { buttonAcceptRuleInit } = require('./interaction/button/buttonAcceptRule');

const interactionCreateEventInit = (client) => {
  // Commands
  commandPollInit(client);
  commandRuleInit(client);
  commandStaffInit(client);
  commandAnnounceInit(client);
  commandRoleInit(client);
  commandThreadInit(client);
  commandStatutInit(client);
  commandClearInit(client);

  //Buttons
  buttonAcceptRuleInit(client);
}

module.exports = { interactionCreateEventInit }