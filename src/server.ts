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
import { voiceEventInit } from "@events/voiceEvent";
import { reactionAddEventInit } from "@events/messageReactionAddEvent";
import { reactionRemoveEventInit } from "@events/messageReactionRemoveEvent";
import { interactionCreateEventInit } from "@events/interactionCreateEvent";
import { messageCreateEventInit } from "@events/messageCreateEvent";
import { messageEditInit } from "@events/messageEditEvent";
import { automod } from "@events/messageModerationEvent";
import Logs from "@libs/Logs";
import Api from "./config/Api.config";
import AutomodDaemon from "@functions/automod/Automod";
import Start from "@libs/Start";
import { CommandRegisterDaemon } from "./daemon/Command.daemon";
import { AddonRegisterDaemon } from "./daemon/Addon.daemon";
import { AddonTwitch } from "@modules/Twitch.module";
import GuildModel from "@models/Guild.model";
import pastilleAxios from "@libs/PastilleAxios";

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

const guildStarter = async (guild: Guild) => {
  try {
    Logs({
      node: ["booter", "guild_starter"],
      state: "start",
      content: "start all functions",
      details: guild?.id,
    });
    AutomodDaemon(guild);
    CommandRegisterDaemon(guild);
    AddonRegisterDaemon(guild);

    // adding to database if not exists
    try {
      await pastilleAxios.post("/guild/join", guild.toJSON());
    } catch (err: any) {}
  } catch (err: any) {}
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
  Start();

  Logs({
    node: ["booter"],
    state: "start",
    content: "pastille has started successfully",
  });
  Logs({
    node: ["booter"],
    state: null,
    content: `authenticated has ${client.user?.displayName}`,
  });
  setStatus();

  try {
    // API
    Api();

    if (process.env.DEV !== "1") {
      AddonTwitch(client);
    } else {
      Logs({
        node: ["server", "init"],
        state: null,
        content: "Skipping Twitch addon initialization in development mode",
        devOnly: true,
      });
    }

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
    } catch (err: any) {
      Logs({ node: ["booter"], state: "error", content: err });
    }
  } catch (err: any) {
    Logs({ node: ["api", "server"], state: "error", content: err });
  }

  client.on(Events.GuildCreate, (event) => {
    Logs({
      node: ["events", "new_guild"],
      state: null,
      content: "join a new guild",
      details: event?.id,
    });
    guildStarter(event);
    setStatus();
  });

  client.on(Events.GuildDelete, async (event) => {
    Logs({
      node: ["events", "leave_guild"],
      state: null,
      content: "left or kicked from a guild",
      details: event?.id,
    });
    try {
      await GuildModel.findOneAndDelete({ id: event.id });
    } catch (err: any) {
      Logs({ node: ["events", "leave_guild"], state: "error", content: err });
    }
    setStatus();
  });
};

try {
  client.on("clientReady", pastilleBooter);
  client.login(process.env.BOT_TOKEN);
} catch (err: any) {
  Logs({ node: ["client", "connect"], state: "error", content: err });
}
