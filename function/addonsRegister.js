const { addons } = require ('../config/settings.json');
const { logsEmiter } = require('../function/logs');

let client;

const addonsRegisterInit = async (clientItem) => {
    client = clientItem;

    addonsRegister();
}

const addonsRegister = async () => {
    addons.map(addons => {
        addons.active ?
        logsEmiter(`Addons loader : 🟢 | ${addons.name} → ${addons.active}`) :
        logsEmiter(`Addons loader : 🔴 | ${addons.name} → ${addons.active}`)

        if(addons.active) {
            const { addonsLoaded } = require(`../addons/${addons.name}`);
            addonsLoaded(client, addons);
        }
    })
}

const addonsLaunch = (addons) => {

}

module.exports = { addonsRegisterInit, addonsRegister, addonsLaunch }