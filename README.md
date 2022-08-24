# pastille-bot
It's a bot. An explosive bot named Pastille but only for an discord !

<div align="center">
	<br />
	<p>
		<img src="https://pooks.fr/pastille_bot_header.png" alt="Pastille" />
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
    "countdown": WAITING_TIME_IN_MS,
    "version": "1.1.dev",
    "debug": false,
    "waiting": true,
    "channel": {
        "debug": DISCORD_CHANNEL_NAME_FOR_DEBUG,
        "announce": DISCORD_CHANNEL_NAME_FOR_ANNOUNCEMENT
    },
    "role": {
        "announce": ROLE_ID_FOR_ANNOUNCEMENT,
        "onlive": ROLE_ID_FOR_USER_LIVE
    },
    "bang": "!",
    "emoji": {
        "poll": EMOJI_NAME_FOR_POLL,
        "live": EMOJI_NAME_FOR_LIVE
    },
    "api": {
        "twitch_stream": "https://api.twitch.tv/helix/streams?user_id=",
        "twitch_oauth": "https://id.twitch.tv/oauth2/token?client_id="
    },
    "app_name": {
        "worker": "CMDS_WORKER",
        "twitch": "MOD_TWITCH",
        "cmds": "CMDS_REGISTER"
    }
}
```

#### data/streamer.json
```json
{
  "0": {
    "discord_id": ID_DISCORD,
    "discord_name": DISCORD_NAME,
    "twitch_id": ID_TWITCH,
    "twitch_name": TWITCH_NAME
  }
}
```
