const { logs } = require('../function/logs');
const { getAddons } = require('./base');

const addonsRegisterInit = async (guild) => {
  const guildAddons = await getAddons(guild);
  addonsRegister(guildAddons, guild);
}

const addonsRegister = async (addons, guild) => {
  if(addons) {
    try {
      addons.map(item => {
        item.active ?
        logs('infos', 'addons:register', `[ ACTIVE ] ${item.name}`, guild.id) :
        logs('infos', 'addons:register', `[INACTIVE] ${item.name}`, guild.id)

        if(item.active) {
          const { addonsLoaded } = require(`../addons/${item.name}`);
          addonsLoaded(guild, item);
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