const { commandPollInit } = require('./interaction/commandPoll');
const { commandRuleInit } = require('./interaction/commandRule');
const { commandStaffInit } = require('./interaction/commandStaff');
const { commandAnnounceInit } = require('./interaction/commandAnnounce');
const { commandRoleInit } = require('./interaction/commandRole');
const { commandThreadInit } = require('./interaction/commandThread');
const { commandStatutInit } = require('./interaction/commandStatut');
const { commandClearThreadInit } = require('./interaction/commandClearThread');

let client;

const interactionCreateEventInit = (clientItem) => {

    client = clientItem;

    commandPollInit(client);
    commandRuleInit(client);
    commandStaffInit(client);
    commandAnnounceInit(client);
    commandRoleInit(client);
    commandThreadInit(client);
    commandStatutInit(client);
    commandClearThreadInit(client);
}

module.exports = { interactionCreateEventInit }