const { addons } = require ('../config/settings.json');
const { logs } = require('../function/logs');

let client;

const addonsRegisterInit = async (clientItem) => {
    client = clientItem;

    addonsRegister();
}

const addonsRegister = async () => {
    addons.map(addons => {
        addons.active ?
        logs('infos', 'addons:loader', `[ ACTIVE ] ${addons.name}`) :
        logs('infos', 'addons:loader', `[INACTIVE] ${addons.name}`)

        if(addons.active) {
            const { addonsLoaded } = require(`../addons/${addons.name}`);
            addonsLoaded(client, addons);
        }
    })
}

const addonsLaunch = (addons) => {

}

module.exports = { addonsRegisterInit, addonsRegister, addonsLaunch }