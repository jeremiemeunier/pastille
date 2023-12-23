const { logs } = require('../function/logs');
const { getAddons } = require('./base');

const addonsRegisterInit = async (guild) => {
  const guildAddons = await getAddons(guild);
  addonsRegister(guildAddons, guild);
}

const addonsRegister = async (addons, guild) => {
  if(addons) {
    try {
      addons.map(addons => {
        addons.active ?
        logs('infos', 'addons:register', `[ ACTIVE ] ${addons.name}`) :
        logs('infos', 'addons:register', `[INACTIVE] ${addons.name}`)

        if(addons.active) {
          const { addonsLoaded } = require(`../addons/${addons.name}`);
          addonsLoaded(guild, addons);
        }
      });
    }
    catch(error) { logs("error", "addons:register:map", error); }
  }
  else { logs("infos", "addons:register", "No addons", guild.id); }
}

const addonsLaunch = (addons) => {

}

module.exports = { addonsRegisterInit, addonsRegister, addonsLaunch }