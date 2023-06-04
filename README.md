# pastille-bot

📣 A big update is on the way ! Wait a few days and it come

It's a bot. An explosive bot named Pastille but only for an discord !

<div align="center">
	<br />
	<p>
		<img src="https://1.images.cdn.pooks.fr/github/pastillebot/white.png" alt="Pastille" media="(prefers-color-scheme: light)" />
	</p>
  <br>
  <p>
    Dependencies<br>
    <a href="https://www.npmjs.com/package/discord.js"><img alt="npm" src="https://img.shields.io/npm/v/discord.js?label=discord.js"></a>
    <a href="https://www.npmjs.com/package/xmlhttprequest"><img alt="npm" src="https://img.shields.io/npm/v/xmlhttprequest?label=xmlhttprequest"></a>
    <a href="https://www.npmjs.com/package/@discordjs/rest"><img alt="npm" src="https://img.shields.io/npm/v/@discordjs/rest?label=@discordjs/rest"></a>
    <a href="https://www.npmjs.com/package/fs"><img alt="npm" src="https://img.shields.io/npm/v/fs?label=fs"></a>
    <a href="https://www.npmjs.com/package/discordjs-automod"><img alt="npm" src="https://img.shields.io/npm/v/discordjs-automod?label=discordjs-automod"></a>
  </p>
</div>

## Configuration files

For configuration of pastille-bot you must have these files : [data/secret.json](https://github.com/jeremiemeunier/pastille-bot/blob/main/data/config.sample.json),
[data/config.json](https://github.com/jeremiemeunier/pastille-bot/blob/main/data/config.sample.json), 
(only for using mod-twitch : [data/streamer.json](https://github.com/jeremiemeunier/pastille-bot/blob/main/data/config.sample.json))

#### data/secret.json

To create your discord app : [Discord Developers](https://discord.com/developers/applications)<br />
To create your twitch app : [Twitch Developers](https://dev.twitch.tv/console/apps/create)<br />

```json
{
    "BOT_TOKEN": YOUR_DISCORD_BOT_TOKEN_ID,
    "BOT_OWNER_ID": YOUR_DISCORD_ID,
    "GUILD_ID": YOUR_DISCORD_SERVER_ID,
    "BOT_ID": YOUR_BOT_USER_ID,
    "TWITCH_SECRET_TOKEN": YOUR_SECRET_APP_TOKEN
    "TWITCH_CLIENT_TOKEN": YOUR_CLIENT_APP_TOKEN
}
```

#### data/config.json

```json
{
    "version": "1.2.dev_0.4",
    "options": {
        "debug": false,
        "bang": UNIQUE_CHARACTERS,
        "color": HEXADECIMAL_CODE
    },
    "channels": {
        "console": NAME_OF_CHANNEL_FOR_CONSOLE,
        "debug": NAME_OF_CHANNEL_FOR_LOGS,
        "announce": "0000000000000000000",
        "help": "0000000000000000000",
        "voiceText": NAME_OF_CHANNEL_FOR_VOCAL_THREADS
    },
    "moderation": {
        "automod": true,
        "limit": {
            "emoji": 8,
            "tags": 4
        },
        "imune": [
            "0000000000000000000",
            "0000000000000000000",
            "0000000000000000000"
        ],
        "channels": {
            "alert": "0000000000000000000",
            "report": "0000000000000000000",
            "reclamation": "0000000000000000000"
        },
        "rule": "0000000000000000000"
    },
    "app": {
        SPECIFIC_OPTIONS_FOR_MODULE
    }
}
```
<hr>

##### Mod twitch options

```json
"twitch": {
    "name": "MOD_TWITCH",
    "version": "1.2.dev_0.2",
    "role": "0000000000000000000",
    "wait": true,
    "delay": WAITING_TIME_IN_MS,
    "channel": "0000000000000000000"
}
```

##### Mod twitch options

```json
"worker": {
    "name": "CMDS_WORKER",
    "version": "1.2.dev_0.2"
},
```

##### Mod twitch options

```json
"commands": {
    "name": "CMDS_WORKER",
    "version": "1.2.dev_0.2"
},
```

<hr>

#### data/streamer.json
```json
{
  "0": {
    "discord": {
      "id": ID_DISCORD,
      "name": DISCORD_NAME,
    },
    "twitch": {
      "id": ID_TWITCH,
      "name": TWITCH_NAME
    },
    "progress": BOOLEAN,
    "notif_line": STRING
  }
}
```

## commands

Folder of commands

### Folder structure

You can add commands in subfolder.

```
your_bot_folder/
├── node_modules
├── data/
|   ├── config.json
|   └── secret.json
├── commands/
|   └── base/
|       └── command.js
└── pastille_worker.js
```

```js
const commands =
{
    name: "NAME_OF_COMMANDS",
    description: "DESCRIPTION_OF_COMMANDS"
};

module.exports = {
    data: commands
}
```