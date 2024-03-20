import { env, on, exit } from "process";
import { connect } from "mongoose";

// BDD
connect(env.MONGODB_URL);

// ##### BOT SETUP ##### \\

import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActivityType,
} from "discord.js";
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

import { logs } from "./function/logs";
import { voiceEventInit } from "./events/voiceEvent";
import { reactionAddEventInit } from "./events/messageReactionAddEvent";
import { reactionRemoveEventInit } from "./events/messageReactionRemoveEvent";
import { interactionCreateEventInit } from "./events/interactionCreateEvent";
import { messageCreateEventInit } from "./events/messageCreateEvent";
import { addonsRegisterInit } from "./function/addonsRegister";
import { automod } from "./events/messageModerationEvent";
import { automodVerifier } from "./function/automod/automodVerifer";
import { api } from "./function/api";
import { messageEditInit } from "./events/messageEditEvent";

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

on("SIGINT", async () => {
  logs("infos", "process:stop", "Process has request to stop");
  exit(300);
});

try {
  client.on("ready", () => {
    pastilleBooter();
  });
  client.login(env.BOT_TOKEN);
} catch (error) {
  logs("error", "client:connect", error);
}
