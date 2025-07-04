# pastille-bot

Pastille is an explosive Discord bot written in TypeScript.

![Pastille](https://images.cdn.jeremiemeunier.fr/github/pastille_couv.png)

## Dependencies

[![discord.js](https://img.shields.io/npm/v/discord.js?label=discord.js)](https://www.npmjs.com/package/discord.js)
[![axios](https://img.shields.io/npm/v/axios?label=axios)](https://www.npmjs.com/package/axios)
[![discordjs/rest](https://img.shields.io/npm/v/@discordjs/rest?label=@discordjs/rest)](https://www.npmjs.com/package/@discordjs/rest)
[![express](https://img.shields.io/npm/v/express?label=express)](https://www.npmjs.com/package/express)

## Prerequisites

If you use categories to keep your Discord server organised, create a text channel named as defined in `channels > voiceText` inside each category that contains a voice channel.

Pastille exposes a small HTTP API used for automoderation and addons such as Twitch or DailyUI.

## Usage

Install the dependencies and start the bot:

```bash
npm install
npm run dev   # start in development with nodemon
npm run prod  # start in production
```

## Configuration files

For configuration of pastille-bot you must have these files : [data/secret.json](https://github.com/jeremiemeunier/pastille-bot/blob/main/data/config.sample.json),
[data/config.json](https://github.com/jeremiemeunier/pastille-bot/blob/main/data/config.sample.json),
(only for using addons twitch : [data/addons/streamer.json](https://github.com/jeremiemeunier/pastille-bot/blob/main/data/addons/config.sample.json)).

### Env vars

- To create your discord app : [Discord Developers](https://discord.com/developers/applications)
- To create your twitch app : [Twitch Developers](https://dev.twitch.tv/console/apps/create)

```json
{
  "BOT_TOKEN": YOUR_DISCORD_BOT_TOKEN_ID,
  "BOT_ID": YOUR_BOT_USER_ID,
  "TWITCH_SECRET": YOUR_TWITCH_SECRET_TOKEN,
  "TWITCH_CLIENT": YOUR_TWITCH_CLIENT_ID,
  "MONGO_URI": YOUR_MONGODB_URI,
}
```

You can use [infisical cli](https://infisical.com) to manage and use secret more secure

## commands

Folder of commands

### Folder structure

You can add commands in subfolder.

```txt
your_bot_folder/
├── ...
├── commands/
|   └── base/
|       └── command.ts
└── server.ts
```

```ts
const commands = {
  name: "NAME_OF_COMMAND",
  description: "RESUME_OF_COMMAND",
  default_member_permissions: 0,
};

export const data = commands;
```
