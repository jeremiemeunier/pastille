import { connect } from "mongoose";

// BDD
connect(process.env.MONGODB_URL as string);

// ##### BOT SETUP ##### \\

import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActivityType,
  Guild,
} from "discord.js";
import logs from "@functions/logs";
import { commandRegister } from "@functions/commandsRegister";
import { voiceEventInit } from "@events/voiceEvent";
import { reactionAddEventInit } from "@events/messageReactionAddEvent";
import { reactionRemoveEventInit } from "@events/messageReactionRemoveEvent";
import { interactionCreateEventInit } from "@events/interactionCreateEvent";
import { messageCreateEventInit } from "@events/messageCreateEvent";
import { messageEditInit } from "@events/messageEditEvent";
import { automod } from "@events/messageModerationEvent";
import { api } from "@functions/api";
import { addonsRegisterInit } from "@functions/addonsRegister";
import { automodVerifier } from "@functions/automod/automodVerifer";

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
    logs("start", "booter:guild_starter", "Start all functions", guild.id);
    automodVerifier(guild);
    commandRegister(guild);
    addonsRegisterInit(guild);
  } catch (error: any) {
    logs("error", "booter:guild_starter", error, guild.id);
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
    } catch (error: any) {
      logs("error", "booter", error);
    }
  } catch (error: any) {
    logs("error", "api:server", error);
  }

  client.on(Events.GuildCreate, (event) => {
    console.log(event);

    logs(null, "events:new_guild", "Join a new guild", event.id);
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
  logs("error", "client:connect", error);
}
