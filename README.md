# pastille-bot

It's a bot. An explosive bot named Pastille but only for discord !

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

## Prerequires

If you are using category for control and organized your discord server, you must create an text channel with the name indicate in the settings for `channels > voiceText` in all category with an voice channel.

Pastille implement an auto host api for automoderation.

package.json
```json
{
  "dependencies": {
    "@discordjs/rest": "^2.0.1",
    "axios": "^1.5.0",
    "discord.js": "^14.13.0",
    "nodemon": "^3.0.1",
    "cors": "^2.8.5",
    "mongoose": "^7.2.4",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.0"
  }
}
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
    "TWITCH_SECRET_TOKEN": YOUR_SECRET_APP_TOKEN,
    "TWITCH_CLIENT_TOKEN": YOUR_CLIENT_APP_TOKEN
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
            "role": ROLE_ID
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
