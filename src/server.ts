import { connect } from "mongoose";

// BDD
connect(process.env.MONGO_URI as string);

// ##### BOT SETUP ##### \\

import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActivityType,
  Guild,
} from "discord.js";
import { commandRegister } from "@functions/commandsRegister";
import { voiceEventInit } from "@events/voiceEvent";
import { reactionAddEventInit } from "@events/messageReactionAddEvent";
import { reactionRemoveEventInit } from "@events/messageReactionRemoveEvent";
import { interactionCreateEventInit } from "@events/interactionCreateEvent";
import { messageCreateEventInit } from "@events/messageCreateEvent";
import { messageEditInit } from "@events/messageEditEvent";
import { automod } from "@events/messageModerationEvent";
import { addonsRegisterInit } from "@functions/addonsRegister";
import { automodVerifier } from "@functions/automod/automodVerifer";
import Logs from "@libs/Logs";
import Api from "./config/Api";

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

// ##### APP ##### \\

const guildStarter = (guild: Guild) => {
  try {
    Logs("booter:guild_starter", "start", "Start all functions", guild.id);
    automodVerifier(guild);
    commandRegister(guild);
    addonsRegisterInit(guild);
  } catch (error: any) {
    Logs("booter:guild_starter", "error", error, guild.id);
  }
};

const setStatus = async () => {
  const allGuilds = client.guilds.cache;
  const guildLength = allGuilds.map((x) => x).length;

  client.user?.setPresence({
    activities: [
      {
        name: `Prend soins de ${
          guildLength > 1 ? `${guildLength} serveurs` : `${guildLength} serveur`
        }`,
        type: ActivityType.Custom,
      },
    ],
  });
};

const pastilleBooter = async () => {
  Logs("booter", "start", "Pastille has started successfully");
  setStatus();

  try {
    // API
    Api();

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
    } catch (error: any) {
      Logs("booter", "error", error);
    }
  } catch (error: any) {
    Logs("api:server", "error", error);
  }

  client.on(Events.GuildCreate, (event) => {
    console.log(event);

    Logs("events:new_guild", null, "Join a new guild", event.id);
    guildStarter(event);
    setStatus();
  });
};

try {
  client.on("ready", () => {
    pastilleBooter();
  });
  client.login(process.env.BOT_TOKEN);
} catch (error: any) {
  Logs("client:connect", "error", error);
}
