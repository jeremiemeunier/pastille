# pastille-bot

Pastille is an explosive Discord bot written in TypeScript.

<div align="center">
	<br />
	<p>
		<img src="https://1.images.cdn.digitalteacompany.fr/github/pastillemd.png" alt="Pastille" />
	</p>
  <br>
  <p>
    Dependencies<br>
    <a href="https://www.npmjs.com/package/discord.js"><img alt="npm" src="https://img.shields.io/npm/v/discord.js?label=discord.js"></a>
    <a href="https://www.npmjs.com/package/axios"><img alt="npm" src="https://img.shields.io/npm/v/axios?label=axios"></a>
    <a href="https://www.npmjs.com/package/@discordjs/rest"><img alt="npm" src="https://img.shields.io/npm/v/@discordjs/rest?label=@discordjs/rest"></a>
    <a href="https://www.npmjs.com/package/fs"><img alt="npm" src="https://img.shields.io/npm/v/fs?label=fs"></a>
    <a href="https://www.npmjs.com/package/express"><img alt="npm" src="https://img.shields.io/npm/v/express?label=express"></a>
  </p>
</div>

## Prerequisites

If you use categories to keep your Discord server organised, create a text channel named as defined in `channels > voiceText` inside each category that contains a voice channel.

Pastille exposes a small HTTP API used for automoderation and addons such as Twitch or DailyUI.

package.json
```json
{
  "dependencies": {
    "@discordjs/rest": "^2.5.0",
    "axios": "^1.9.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "discord.js": "^14.19.3",
    "express": "^5.1.0",
    "mongoose": "^8.15.1",
    "mysql2": "^3.14.1",
    "node-cron": "^4.1.0",
    "sequelize": "^6.37.7",
    "tsc-alias": "^1.8.16",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.8.3"
  }
}
```

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

#### data/secret.json

To create your discord app : [Discord Developers](https://discord.com/developers/applications)<br />
To create your twitch app : [Twitch Developers](https://dev.twitch.tv/console/apps/create)<br />

```json
{
    "BOT_TOKEN": YOUR_DISCORD_BOT_TOKEN_ID,
    "BOT_OWNER_ID": YOUR_DISCORD_ID,
    "GUILD_ID": YOUR_DISCORD_SERVER_ID,
    "BOT_ID": YOUR_BOT_USER_ID,
    "TWITCH_SECRET": YOUR_TWITCH_SECRET_TOKEN,
    "TWITCH_CLIENT": YOUR_TWITCH_CLIENT_ID,
    "BOT_SECRET_SIG": YOUR_WEBHOOK_SIGNATURE,
    "MONGO_URI": YOUR_MONGODB_URI,
    "DB_NAME": YOUR_MYSQL_DATABASE,
    "DB_USER": YOUR_MYSQL_USER,
    "DB_PSWD": YOUR_MYSQL_PASSWORD,
    "DB_HOST": YOUR_MYSQL_HOST,
    "PORT": YOUR_PORT
}
```

#### data/config.json

```json
{
    "version": "1.3.0",
    "options": {
        "debug": BOOLEAN,
        "bang": UNIQUE_CHARACTERS,
        "color": HEXADECIMAL_CODE,
        "reaction": {
            "rule": EMOJI,
            "ticket": EMOJI,
            "announce": EMOJI,
            "warn": EMOJI
        },
        "wait": 300000
    },
    "channels": {
        "console": NAME_OF_CHANNEL,
        "debug": NAME_OF_CHANNEL,
        "announce": ID_OF_CHANNEL,
        "help": ID_OF_CHANNEL,
        "voiceText": NAME_OF_CHANNEL,
        "screenshots": NAME_OF_CHANNEL
    },
    "moderation": {
        "automod": BOOLEAN,
        "limit": {
            "emoji": 8,
            "tags": 4
        },
        "imune": [
            ROLE_ID
        ],
        "channels": {
            "alert": CHANNEL_ID,
            "report": CHANNEL_ID,
            "reclamation": CHANNEL_ID,
            "rule": CHANNEL_ID
        },
        "roles": {
            "muted": ROLE_ID
        }

    },
    "addons": [
        {
            "name": "", "active": BOOLEAN,
            "channel": CHANNEL_ID,
            "role": ROLE_ID,
            "params": {}
        }
    ]
}
```

<hr>

#### data/addons/streamer.json

```json
{
    "streamer": [
        {
            "discord": {
                "id": DISCORD_ID,
                "name": DISCORD_PSEUDO
            },
            "twitch": {
                "id": TWITCH_ID,
                "name": TWITCH_NAME
            },
            "progress": BOOLEAN
        }
    ]
}
```

## commands

Folder of commands

### Folder structure

You can add commands in subfolder.

```
your_bot_folder/
├── addons/
├── data/
|   ├── config.json
|   └── secret.json
├── commands/
|   └── base/
|       └── command.js
└── pastille.js
```

```js
const commands = {
  name: "NAME_OF_COMMANDS",
  description: "DESCRIPTION_OF_COMMANDS",
};

module.exports = {
  data: commands,
};
```
