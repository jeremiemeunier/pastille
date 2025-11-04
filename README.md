# pastille-bot

Pastille is a feature-rich Discord bot written in TypeScript, designed to manage community servers with powerful moderation, role management, and integration features.

![Pastille](https://images.cdn.jeremiemeunier.fr/github/pastille_couv.png)

## Features

- 🛡️ **Automoderation** - Automated content moderation with configurable limits and sanctions
- 🎭 **Role Management** - Reaction roles and customizable role assignment
- 📋 **Rules System** - Manage and display server rules
- 🎨 **DailyUI Challenges** - Daily design challenges for your community
- 📺 **Twitch Integration** - Automatic stream announcements with webhook support
- ⚙️ **Custom Commands** - Create custom bot commands per guild
- 🎯 **Infraction Tracking** - Track and manage user infractions
- 🔧 **REST API** - Comprehensive HTTP API for external integrations

## Dependencies

[![discord.js](https://img.shields.io/npm/v/discord.js?label=discord.js)](https://www.npmjs.com/package/discord.js)
[![axios](https://img.shields.io/npm/v/axios?label=axios)](https://www.npmjs.com/package/axios)
[![discordjs/rest](https://img.shields.io/npm/v/@discordjs/rest?label=@discordjs/rest)](https://www.npmjs.com/package/@discordjs/rest)
[![express](https://img.shields.io/npm/v/express?label=express)](https://www.npmjs.com/package/express)
[![mongoose](https://img.shields.io/npm/v/mongoose?label=mongoose)](https://www.npmjs.com/package/mongoose)

## Prerequisites

- **Node.js** 18.x or higher
- **MongoDB** 4.4 or higher
- **Discord Bot Application** - Create one at [Discord Developers](https://discord.com/developers/applications)
- **(Optional) Twitch Application** - For Twitch integration features

### Discord Server Setup

If you use categories to organize your Discord server, create a text channel named as defined in `channels > voiceText` (default: "voix-avec-les-mains") inside each category that contains a voice channel.

The bot exposes an HTTP API on port 3000 for automoderation and addons such as Twitch or DailyUI.

## Usage

Install the dependencies and start the bot:

```bash
npm install
npm run dev   # start in development with nodemon
npm run prod  # start in production
```

## Configuration

Pastille stores most configuration in MongoDB. Settings are managed per guild through the API endpoints or Discord commands.

### Initial Configuration

1. **Set up environment variables** (see Environment Variables section below)
2. **Start MongoDB** on your server or use a hosted service
3. **Configure your Discord bot** with required permissions:
   - Manage Roles
   - Manage Channels
   - Send Messages
   - Manage Messages
   - Read Message History
   - Add Reactions
   - Manage Webhooks

### Per-Guild Settings

Each Discord server can be configured with custom settings through the `/settings/add` API endpoint or by using the bot commands. Configuration includes:

- Channel assignments (announcements, support, screenshots, etc.)
- Moderation limits (emoji, mentions, links, invites)
- Sanction durations (low, medium, high severity)
- Role assignments (muted, rule acceptance, staff)
- Addon activation (Twitch, DailyUI)

### Environment Variables

The following environment variables are required:

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Discord bot token from [Discord Developers](https://discord.com/developers/applications) | Yes |
| `BOT_ID` | Your Discord bot user ID | Yes |
| `MONGO_URI` | MongoDB connection URI | Yes |
| `TWITCH_SECRET` | Twitch application secret token from [Twitch Developers](https://dev.twitch.tv/console/apps/create) | For Twitch addon |
| `TWITCH_CLIENT` | Twitch application client ID | For Twitch addon |
| `BOT_SECRET_SIG` | Secret for Twitch webhook signature verification | For Twitch addon |
| `DISCORD_PUBLIC_KEY` | Discord application public key for webhook verification | For Discord webhooks |

**Example .env file:**
```bash
BOT_TOKEN=your_discord_bot_token
BOT_ID=your_bot_user_id
MONGO_URI=mongodb://localhost:27017/pastille
TWITCH_SECRET=your_twitch_secret
TWITCH_CLIENT=your_twitch_client_id
BOT_SECRET_SIG=your_webhook_secret
DISCORD_PUBLIC_KEY=your_discord_public_key
```

You can use [Infisical CLI](https://infisical.com) to manage and use secrets more securely.

## API Documentation

Pastille exposes a REST API on port 3000 for managing bot data and integrations. All API routes require authentication via the `pastille_botid` header.

### Authentication

All API requests must include the following header:
```
pastille_botid: YOUR_BOT_ID
```

### Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP address.

### API Endpoints

#### Infractions

**POST /infraction** - Create a new infraction
```json
{
  "user_id": "string",
  "guild_id": "string",
  "reason": "string",
  "date": "ISO8601 date"
}
```

**GET /infraction/all** - Get infraction count
```
Query params: user_id, guild_id
```

#### Sanctions

**POST /sanction/add** - Create a sanction
```json
{
  "user_id": "string",
  "guild_id": "string",
  "level": "number",
  "date": "ISO8601 date",
  "end": "ISO8601 date"
}
```

**GET /sanction** - Get all checkable sanctions for a guild
```
Query params: guild_id
```

**PUT /sanction/update** - Mark sanction as checked
```
Query params: id
```

#### DailyUI

**POST /dailyui** - Add a daily UI challenge
```json
{
  "guild_id": "string",
  "state": "boolean",
  "title": "string",
  "description": "string"
}
```

**POST /dailyui/mass** - Add multiple daily UI challenges
```json
{
  "data": [
    {
      "guild_id": "string",
      "title": "string",
      "description": "string"
    }
  ]
}
```

**GET /dailyui** - Get available daily UI challenge
```
Query params: guild_id
```

**PUT /dailyui** - Mark daily UI as sent
```
Query params: id
```

#### Twitch Integration

**GET /twitch/streamers** - Get unvalidated streamers

**GET /twitch/live** - Get live streamers to announce

**POST /twitch/streamers** - Add streamer notification
```json
{
  "streamer_id": "string",
  "streamer_name": "string",
  "guild_id": "string",
  "channel_id": "string",
  "role_id": "string",
  "message": "string",
  "progress": "boolean"
}
```

**PATCH /twitch/streamers/:id** - Validate streamer

**DELETE /twitch/streamers** - Remove streamer notification
```json
{
  "streamer_id": "string",
  "guild_id": "string"
}
```

**POST /twitch/webhook** - Twitch EventSub webhook endpoint

#### Rules

**GET /rules** - Get all rules for a guild
```
Query params: guild_id
```

**POST /rules/add** - Create a rule
```json
{
  "guild_id": "string",
  "name": "string",
  "description": "string",
  "active": "boolean"
}
```

**PUT /rules/update** - Update a rule
```json
{
  "id": "string",
  "guild_id": "string",
  "name": "string",
  "description": "string",
  "active": "boolean"
}
```

#### Roles

**GET /roles** - Get all roles for a guild
```
Query params: guild_id
```

**POST /roles/add** - Create a role
```json
{
  "guild_id": "string",
  "name": "string",
  "description": "string",
  "role": "string",
  "emote": "string"
}
```

**PUT /roles/update** - Update a role
```json
{
  "id": "string",
  "guild_id": "string",
  "name": "string",
  "description": "string",
  "role": "string",
  "emote": "string"
}
```

#### Addons

**GET /addons** - Get all addons for a guild
```
Query params: guild_id
```

**POST /addons/add** - Register an addon
```json
{
  "guild_id": "string",
  "name": "string",
  "active": "boolean",
  "channel": "string",
  "role": "string"
}
```

**PUT /addons/update** - Update an addon
```json
{
  "id": "string",
  "guild_id": "string",
  "name": "string",
  "active": "boolean",
  "channel": "string",
  "role": "string"
}
```

#### Settings

**GET /settings** - Get guild settings
```
Query params: guild_id
```

**POST /settings/add** - Create guild settings
```json
{
  "guild_id": "string",
  "premium": "boolean",
  "premium_end": "ISO8601 date or null",
  "options": {
    "bang": "string",
    "color": "string",
    "channels": {
      "announce": "string",
      "help": "string",
      "voiceText": "string",
      "screenshots": "string"
    }
  },
  "moderation": {
    "sharing": "boolean",
    "channels": {
      "alert": "string or null",
      "report": "string or null",
      "automod": "string or null"
    },
    "limit": {
      "emoji": "number",
      "mention": "number",
      "link": "number",
      "invite": "number"
    },
    "imune": ["array of channel ids"],
    "roles": {
      "muted": "string or null",
      "rule": "string or null",
      "staff": "string or null"
    },
    "sanctions": {
      "low": { "duration": "number", "unit": "string" },
      "medium": { "duration": "number", "unit": "string" },
      "hight": { "duration": "number", "unit": "string" }
    }
  }
}
```

#### Commands

**GET /commands** - Get all commands for a guild
```
Query params: guild_id
```

**GET /commands/id** - Get a specific command
```
Query params: id
```

**POST /commands/add** - Create a command
```json
{
  "guild_id": "string",
  "terms": "string",
  "response": "string",
  "role_id": "string (optional)"
}
```

#### Emotes

**GET /emotes** - Get emote by letter
```
Query params: letter
```

**GET /emotes/all** - Get all emotes
```
Query params: limit (optional)
```

**POST /emotes/mass** - Add multiple emotes
```json
{
  "emotes": [
    {
      "letter": "string",
      "emote": "string"
    }
  ]
}
```

#### Webhooks

**POST /discord/webhook** - Discord webhook endpoint

## Testing

Run tests with:

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Commands

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

## Architecture

Pastille follows a modular architecture:

```
pastille/
├── src/
│   ├── commands/       # Discord slash commands
│   ├── events/         # Discord event handlers
│   ├── routes/         # Express API routes
│   ├── models/         # MongoDB models
│   ├── middlewares/    # Express middlewares
│   ├── libs/           # Utility libraries
│   ├── modules/        # Feature modules
│   ├── functions/      # Helper functions
│   └── server.ts       # Main entry point
├── __tests__/          # Test files
└── jest.config.js      # Test configuration
```

## Development

### Project Structure

- **Routes** (`src/routes/`) - REST API endpoints for external integrations
- **Events** (`src/events/`) - Discord.js event handlers for bot interactions
- **Models** (`src/models/`) - Mongoose schemas for MongoDB collections
- **Commands** (`src/commands/`) - Discord slash command implementations
- **Middlewares** (`src/middlewares/`) - Express middleware (authentication, rate limiting)

### Adding New Features

1. **Add API Route**: Create a new file in `src/routes/`
2. **Add Model**: Define schema in `src/models/`
3. **Register Route**: Import in `src/config/Api.ts`
4. **Add Tests**: Create test file in `src/__tests__/routes/`

### Code Style

- TypeScript with strict mode enabled
- Path aliases for cleaner imports (`@routes`, `@models`, etc.)
- ESLint and Prettier configuration (if configured)
- Comprehensive error logging via the Logs utility

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new features
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Reporting Issues

Use GitHub Issues to report bugs or request features. Please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For support, please:
- Open an issue on GitHub
- Check existing documentation
- Review the API documentation above

## Acknowledgments

Built with:
- [Discord.js](https://discord.js.org/) - Discord API library
- [Express](https://expressjs.com/) - Web framework
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [TypeScript](https://www.typescriptlang.org/) - Type safety
