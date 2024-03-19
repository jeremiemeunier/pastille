const process = require("process");
const mongoose = require("mongoose");

// BDD
mongoose.connect(process.env.MONGODB_URL);

// ##### BOT SETUP ##### \\

const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActivityType,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const { logs } = require("./function/logs");
const { voiceEventInit } = require("./events/voiceEvent");
const { reactionAddEventInit } = require("./events/messageReactionAddEvent");
const {
  reactionRemoveEventInit,
} = require("./events/messageReactionRemoveEvent");
const {
  interactionCreateEventInit,
} = require("./events/interactionCreateEvent");
const { messageCreateEventInit } = require("./events/messageCreateEvent");
const { addonsRegisterInit } = require("./function/addonsRegister");
const { automod } = require("./events/messageModerationEvent");
const { automodVerifier } = require("./function/automod/automodVerifer");
const { api } = require("./function/api");
const { messageEditInit } = require("./events/messageEditEvent");

// ##### FIX ##### \\
if (!String.prototype.endsWith) {
  Object.defineProperty(String.prototype, "endsWith", {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function (searchString, position) {
      position = position || this.length;
      position = position - searchString.length;
      var lastIndex = this.lastIndexOf(searchString);
      return lastIndex !== -1 && lastIndex === position;
    },
  });
}

// ##### APP ##### \\
const guildStarter = (guild) => {
  const { commandRegister } = require("./function/commandsRegister");

  try {
    logs("start", "booter:guild_starter", "Start all functions", guild.id);
    automodVerifier(guild);
    commandRegister(guild);
    addonsRegisterInit(guild);
  } catch (error) {
    logs("error", "booter:guild_starter", error, guild.id);
  }
};

const setStatus = async () => {
  const allGuilds = client.guilds.cache;
  const guildLength = allGuilds.map((x) => x).length;

  client.user.setPresence({
    activities: [
      {
        name: `Prend soins de ${guildLength > 1 ? `${guildLength} serveurs` : `${guildLength} serveur`}`,
        type: ActivityType.Custom,
      },
    ],
  });
};

const pastilleBooter = async () => {
  logs("start", "booter", "Pastille has started successfully");
  setStatus();

  try {
    // API
    api();

    try {
      const allGuilds = client.guilds.cache;

      allGuilds.map((guild) => {
        guildStarter(guild);
      });

      voiceEventInit(client);
      reactionAddEventInit(client);
      reactionRemoveEventInit(client);
      interactionCreateEventInit(client);
      messageCreateEventInit(client);
      messageEditInit(client);
      automod(client);
    } catch (error) {
      logs("error", "booter", error);
    }
  } catch (error) {
    logs("error", "api:server", error);
  }

  client.on(Events.GuildCreate, (guild) => {
    logs("infos", "events:new_guild", "Join a new guild", guild.id);
    guildStarter(guild);
    setStatus();
  });
};

process.on("SIGINT", async () => {
  logs("infos", "process:stop", "Process has request to stop");
  process.exit(300);
});

try {
  client.on("ready", () => {
    pastilleBooter();
  });
  client.login(process.env.BOT_TOKEN);
} catch (error) {
  logs("error", "client:connect", error);
}
