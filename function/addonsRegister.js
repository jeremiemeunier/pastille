const { addons } = require ('../config/settings.json');

let client;

const addonsRegisterInit = async (clientItem) => {
    client = clientItem;

    addonsRegister();
}

const addonsRegister = async () => {
    addons.map(addons => {
        console.log(addons.name, addons.active);
    })
}

module.exports = { addonsRegisterInit, addonsRegister }