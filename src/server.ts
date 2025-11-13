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
    Logs(
      ["booter", "guild_starter"],
      "start",
      "start all functions",
      guild?.id
    );
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

  Logs(["booter"], "start", "pastille has started successfully");
  Logs(["booter"], null, `authenticated has ${client.user?.displayName}`);
  setStatus();

  try {
    // API
    Api();

    if (process.env.DEV !== "1") AddonTwitch(client);

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
      Logs(["booter"], "error", err);
    }
  } catch (err: any) {
    Logs(["api", "server"], "error", err);
  }

  client.on(Events.GuildCreate, (event) => {
    Logs(["events", "new_guild"], null, "join a new guild", event?.id);
    guildStarter(event);
    setStatus();
  });

  client.on(Events.GuildDelete, async (event) => {
    Logs(
      ["events", "leave_guild"],
      null,
      "left or kicked from a guild",
      event?.id
    );
    try {
      await GuildModel.findOneAndDelete({ id: event.id });
    } catch (err: any) {
      Logs(["events", "leave_guild"], "error", err);
    }
    setStatus();
  });
};

try {
  client.on("clientReady", pastilleBooter);
  client.login(process.env.BOT_TOKEN);
} catch (err: any) {
  Logs(["client", "connect"], "error", err);
}
