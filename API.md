# Pastille Bot API Reference

Complete API reference for the Pastille Discord Bot REST API.

## Base URL

```
http://localhost:3000
```

## Authentication

The Pastille Bot API supports two authentication methods:

### 1. Bot Authentication (for internal services)

All internal API endpoints require authentication via the `pastille_botid` header:

```http
pastille_botid: YOUR_BOT_ID
```

Returns `403 Forbidden` if authentication fails.

### 2. User Authentication (JWT)

User-facing endpoints use JWT-based authentication. After logging in via Discord OAuth, users receive a JWT token as an httpOnly cookie or can use it as a Bearer token.

**Token Methods:**
- **Cookie**: `pastille_token` (httpOnly, secure in production)
- **Header**: `Authorization: Bearer <token>`

**Token Expiration**: 7 days

**Protected Endpoints**: Endpoints marked with 🔒 require JWT authentication.

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Response on limit**: HTTP 429 with message "Too many requests, please try again later."

## Discord API Caching

To improve performance and reduce Discord API rate limit issues, Pastille implements an intelligent caching layer for Discord API responses.

### Caching Strategy

**Cached Endpoints:**
- User data (`/users/@me`) - 5 minutes TTL with encryption
- Guild data (`/users/@me/guilds`) - 10 minutes TTL without encryption

**Not Cached:**
- OAuth token exchanges (one-time use codes)
- POST/PUT/DELETE/PATCH requests

### Cache Security Features

1. **Encryption**: Sensitive user data (personal information, tokens) is encrypted using AES-256-CBC before caching
2. **Cache Isolation**: Each user has isolated cache entries using SHA-256 hashed keys
3. **Automatic Expiration**: Cache entries expire based on TTL (Time-To-Live)
4. **Invalidation on Logout**: User cache is cleared when logging out or from all devices
5. **Secure Key Generation**: Cache keys are derived from JWT secret to prevent guessing

### Cache Benefits

- **Reduced API calls**: Up to 90% reduction in Discord API requests
- **Faster responses**: Sub-millisecond response times for cached data
- **Rate limit protection**: Minimizes risk of hitting Discord API rate limits
- **Improved user experience**: Instant data retrieval on repeated requests

**Note**: Cache is transparent to API consumers - no changes needed to existing client implementations.

## Common Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 403 | Forbidden - Authentication failed |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Endpoints

### Root

#### GET /

Health check endpoint.

**Response**
```json
{
  "message": "This is pastille"
}
```

---

## Authentication & User Management

### Discord OAuth Login

**POST** `/auth/login`

Authenticate user via Discord OAuth2 code and create a session.

**Request Body**
```json
{
  "code": "discord_oauth_code"
}
```

**Response** `200 OK` (existing user) or `201 Created` (new user)
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_mongo_id",
    "discord_id": "123456789012345678",
    "personal": {
      "username": "testuser",
      "global_name": "Test User",
      "avatar": "avatar_hash",
      "banner": "banner_hash",
      "accent_color": "#5865F2",
      "verified": true,
      "email": ""
    }
  },
  "expiresAt": "2024-01-22T10:30:00.000Z"
}
```

**Note**: JWT token is automatically set as `pastille_token` httpOnly cookie.

**Response** `400 Bad Request`
```json
{
  "message": "You must provide a code"
}
```

**Response** `500 Internal Server Error`
```json
{
  "message": "Internal server error"
}
```

### Get Current User 🔒

**GET** `/auth/me`

Get authenticated user's information.

**Headers**
- `Authorization: Bearer <token>` OR
- Cookie: `pastille_token`

**Response** `200 OK`
```json
{
  "user": {
    "_id": "user_mongo_id",
    "discord_id": "123456789012345678",
    "personal": {
      "username": "testuser",
      "global_name": "Test User",
      "avatar": "avatar_hash",
      "verified": true,
      "email": ""
    }
  }
}
```

**Response** `401 Unauthorized`
```json
{
  "message": "Authentication required"
}
```

### Logout 🔒

**POST** `/auth/logout`

Logout from current session.

**Headers**
- `Authorization: Bearer <token>` OR
- Cookie: `pastille_token`

**Response** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### Logout All Devices 🔒

**POST** `/auth/logout/all`

Logout from all devices/sessions.

**Headers**
- `Authorization: Bearer <token>` OR
- Cookie: `pastille_token`

**Response** `200 OK`
```json
{
  "message": "Logged out from all devices"
}
```

### Get User Guilds 🔒

**GET** `/auth/guilds`

Get Discord guilds where the authenticated user has permission to add bots (MANAGE_GUILD permission), with an indicator showing if the bot is already added to each guild.

**Headers**
- `Authorization: Bearer <token>` OR
- Cookie: `pastille_token`

**Response** `200 OK`
```json
[
  {
    "id": "987654321098765432",
    "name": "My Server",
    "icon": "icon_hash",
    "description": "A cool server",
    "owner": false,
    "botAdded": true
  },
  {
    "id": "123456789012345678",
    "name": "Another Server",
    "icon": "another_icon_hash",
    "description": null,
    "owner": true,
    "botAdded": false
  }
]
```

**Response Fields**
- `id`: Discord guild ID
- `name`: Guild name
- `icon`: Guild icon hash (or null)
- `description`: Guild description (or null)
- `owner`: Whether the user owns the guild
- `botAdded`: Whether the Pastille bot is already added to this guild

**Note**: Only returns guilds where the user has MANAGE_GUILD permission (0x00000020), which is required to add bots to servers.

**Response** `401 Unauthorized` (Missing JWT token)
```json
{
  "message": "Authentication required"
}
```

**Response** `401 Unauthorized` (Expired Discord token)
```json
{
  "message": "Discord token expired or invalid",
  "error": "unauthorized",
  "details": "Please log in again to refresh your Discord token"
}
```

**Response** `404 Not Found`
```json
{
  "message": "User not found"
}
```

**Response** `500 Internal Server Error`
```json
{
  "message": "Internal server error"
}
```

---

## User Management

### Get User Profile

**GET** `/user/:discord_id`

Get public user profile by Discord ID. No authentication required.

**URL Parameters**
- `discord_id` (string, required) - Discord user ID

**Response** `200 OK`
```json
{
  "user": {
    "discord_id": "123456789012345678",
    "personal": {
      "username": "testuser",
      "global_name": "Test User",
      "avatar": "avatar_hash",
      "accent_color": "#5865F2",
      "verified": false,
      "email": ""
    }
  }
}
```

**Response** `404 Not Found`
```json
{
  "message": "User not found"
}
```

### Update User Profile 🔒

**PUT** `/user/profile`

Update authenticated user's profile. Only non-sensitive fields can be updated.

**Headers**
- `Authorization: Bearer <token>` OR
- Cookie: `pastille_token`

**Request Body**
```json
{
  "global_name": "New Display Name",
  "avatar": "new_avatar_hash",
  "banner": "new_banner_hash",
  "accent_color": "#FF5733"
}
```

**Allowed Fields**: `global_name`, `avatar`, `banner`, `accent_color`

**Response** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_mongo_id",
    "discord_id": "123456789012345678",
    "personal": {
      "username": "testuser",
      "global_name": "New Display Name",
      "avatar": "new_avatar_hash",
      "verified": true,
      "email": ""
    }
  }
}
```

**Response** `400 Bad Request`
```json
{
  "message": "No valid fields to update"
}
```

### Delete User Account 🔒

**DELETE** `/user/account`

Delete authenticated user's account permanently.

**Headers**
- `Authorization: Bearer <token>` OR
- Cookie: `pastille_token`

**Response** `200 OK`
```json
{
  "message": "Account deleted successfully"
}
```

---

## Infractions

Track user infractions (warnings) in guilds.

### Create Infraction

**POST** `/infraction`

Create a new infraction record for a user.

**Request Body**
```json
{
  "user_id": "123456789012345678",
  "guild_id": "987654321098765432",
  "reason": "Spam in general chat",
  "date": "2024-01-15T10:30:00.000Z"
}
```

**Response** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user_id": "123456789012345678",
  "guild_id": "987654321098765432",
  "warn": {
    "reason": "Spam in general chat",
    "date": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Infraction Count

**GET** `/infraction/all`

Get the total count of infractions for a user in a guild.

**Query Parameters**
- `user_id` (string, required) - Discord user ID
- `guild_id` (string, required) - Discord guild ID

**Response** `200 OK`
```json
3
```

---

## Sanctions

Manage user sanctions (mutes, bans) with expiration tracking.

### Add Sanction

**POST** `/sanction/add`

Create a new sanction for a user.

**Request Body**
```json
{
  "user_id": "123456789012345678",
  "guild_id": "987654321098765432",
  "level": 1,
  "date": "2024-01-15T10:30:00.000Z",
  "end": "2024-01-15T11:30:00.000Z"
}
```

**Response** `204 No Content`

No response body.

### Get Active Sanctions

**GET** `/sanction`

Get all active (checkable) sanctions for a guild.

**Query Parameters**
- `guild_id` (string, required) - Discord guild ID

**Response** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": "123456789012345678",
    "guild_id": "987654321098765432",
    "sanction": {
      "level": 1,
      "date": "2024-01-15T10:30:00.000Z",
      "ending": "2024-01-15T11:30:00.000Z"
    },
    "checkable": true
  }
]
```

### Update Sanction

**PUT** `/sanction/update`

Mark a sanction as checked (no longer active).

**Query Parameters**
- `id` (string, required) - Sanction MongoDB ObjectId

**Response** `204 No Content`

No response body.

---

## Daily UI Challenges

Manage daily UI/UX design challenges for your community.

### Add Challenge

**POST** `/dailyui`

Create a new daily UI challenge.

**Request Body**
```json
{
  "guild_id": "987654321098765432",
  "state": true,
  "title": "Design a Login Page",
  "description": "Create a modern login page with social auth options"
}
```

**Validation**
- `guild_id` must be a string
- `title` must be a string
- `description` must be a string
- `state` is optional (defaults to true)

**Response** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "available": true,
  "title": "Design a Login Page",
  "description": "Create a modern login page with social auth options"
}
```

### Add Multiple Challenges

**POST** `/dailyui/mass`

Bulk create daily UI challenges.

**Request Body**
```json
{
  "data": [
    {
      "guild_id": "987654321098765432",
      "title": "Design a Login Page",
      "description": "Create a modern login page"
    },
    {
      "guild_id": "987654321098765432",
      "title": "Design a Settings Panel",
      "description": "Create an intuitive settings interface"
    }
  ]
}
```

**Response** `201 Created`
```json
{
  "message": "New daily challenge added"
}
```

### Get Available Challenge

**GET** `/dailyui`

Get the next available (unsent) daily UI challenge for a guild.

**Query Parameters**
- `guild_id` (string, required) - Discord guild ID

**Response** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "available": true,
  "title": "Design a Login Page",
  "description": "Create a modern login page"
}
```

**Response** `404 Not Found`
```json
{
  "message": "No dailyui available"
}
```

### Mark Challenge as Sent

**PUT** `/dailyui`

Mark a daily UI challenge as sent (no longer available).

**Query Parameters**
- `id` (string, required) - Challenge MongoDB ObjectId

**Validation**
- `id` must be a valid MongoDB ObjectId

**Response** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "available": false,
  "title": "Design a Login Page",
  "description": "Create a modern login page"
}
```

**Response** `400 Bad Request`
```json
{
  "message": "Invalid Id provided"
}
```

---

## Twitch Integration

Manage Twitch streamer notifications and live announcements.

### Get Unvalidated Streamers

**GET** `/twitch/streamers`

Get all streamers pending validation.

**Response** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "id": "twitch_streamer_id",
    "name": "StreamerName",
    "isValid": false,
    "isLive": false,
    "isAnnounce": false,
    "announcer": [...]
  }
]
```

**Response** `404 Not Found`
```json
{
  "message": "No streamer found"
}
```

### Get Live Streamers

**GET** `/twitch/live`

Get all live streamers that haven't been announced yet.

**Response** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "id": "twitch_streamer_id",
    "name": "StreamerName",
    "isLive": true,
    "isAnnounce": false,
    "announcer": [...]
  }
]
```

**Response** `404 Not Found`
```json
{
  "message": "No live to be announced"
}
```

### Add Streamer Notification

**POST** `/twitch/streamers`

Add a streamer or add a new announcement recipient to an existing streamer.

**Request Body**
```json
{
  "streamer_id": "twitch_streamer_id",
  "streamer_name": "StreamerName",
  "guild_id": "987654321098765432",
  "channel_id": "123456789012345678",
  "role_id": "456789012345678901",
  "message": "🔴 {name} is now live!",
  "progress": false
}
```

**Fields**
- `message` (optional) - Custom announcement message
- `progress` (optional) - Whether to show streaming progress

**Response** `201 Created` - Returns the created/updated streamer document

### Validate Streamer

**PATCH** `/twitch/streamers/:id`

Mark a streamer as validated (EventSub subscription confirmed).

**URL Parameters**
- `id` (string, required) - Streamer MongoDB ObjectId

**Response** `204 No Content`

No response body.

### Remove Streamer Notification

**DELETE** `/twitch/streamers`

Remove an announcement recipient from a streamer, or delete the streamer if it's the last recipient.

**Request Body**
```json
{
  "streamer_id": "twitch_streamer_id",
  "guild_id": "987654321098765432"
}
```

**Response** `204 No Content`

No response body.

### Twitch Webhook (EventSub)

**POST** `/twitch/webhook`

Receive Twitch EventSub notifications for stream status changes.

**Headers**
- `twitch-eventsub-message-id` - Event message ID
- `twitch-eventsub-message-type` - Event type
- `twitch-eventsub-message-timestamp` - Event timestamp
- `twitch-eventsub-message-signature` - HMAC signature

**Event Types**
- `webhook_callback_verification` - Webhook validation
- `notification` - Stream online/offline events

**Response** `200 OK` - Returns challenge for verification
**Response** `403 Forbidden` - Invalid signature

---

## Rules

Manage server rules that users must accept.

### Get All Rules

**GET** `/rules`

Get all rules for a guild.

**Query Parameters**
- `guild_id` (string, required) - Discord guild ID

**Response** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "guild_id": "987654321098765432",
    "name": "No Spam",
    "description": "Do not spam messages in any channel",
    "active": true
  }
]
```

**Response** `404 Not Found`
```json
{
  "message": "No rules found"
}
```

### Create Rule

**POST** `/rules/add`

Create a new rule for a guild.

**Request Body**
```json
{
  "guild_id": "987654321098765432",
  "name": "No Spam",
  "description": "Do not spam messages in any channel",
  "active": true
}
```

**Validation** - All fields required

**Response** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "name": "No Spam",
  "description": "Do not spam messages in any channel",
  "active": true
}
```

### Update Rule

**PUT** `/rules/update`

Update an existing rule.

**Request Body**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "name": "No Spam (Updated)",
  "description": "Updated description",
  "active": false
}
```

**Validation**
- `id` must be a valid MongoDB ObjectId
- All fields required with correct types

**Response** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "name": "No Spam (Updated)",
  "description": "Updated description",
  "active": false
}
```

---

## Roles

Manage reaction roles for self-assignable roles.

### Get All Roles

**GET** `/roles`

Get all reaction roles for a guild.

**Query Parameters**
- `guild_id` (string, required) - Discord guild ID

**Response** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "guild_id": "987654321098765432",
    "name": "Gamer",
    "description": "Get notified about gaming events",
    "role": "role_id_here",
    "emote": "🎮"
  }
]
```

### Create Role

**POST** `/roles/add`

Create a new reaction role.

**Request Body**
```json
{
  "guild_id": "987654321098765432",
  "name": "Gamer",
  "description": "Get notified about gaming events",
  "role": "role_id_here",
  "emote": "🎮"
}
```

**Validation** - All fields required

**Response** `201 Created`

### Update Role

**PUT** `/roles/update`

Update an existing reaction role.

**Request Body**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "name": "Gamer (Updated)",
  "description": "Updated description",
  "role": "role_id_here",
  "emote": "🎮"
}
```

**Validation**
- `id` must be a valid MongoDB ObjectId
- All fields required with correct types

**Response** `200 OK`

---

## Addons

Enable and configure bot addons (Twitch, DailyUI, etc.) per guild.

### Get All Addons

**GET** `/addons`

Get all configured addons for a guild.

**Query Parameters**
- `guild_id` (string, required) - Discord guild ID

**Response** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "guild_id": "987654321098765432",
    "name": "twitch",
    "active": true,
    "channel": "channel_id",
    "role": "role_id"
  }
]
```

### Register Addon

**POST** `/addons/add`

Register and configure an addon for a guild.

**Request Body**
```json
{
  "guild_id": "987654321098765432",
  "name": "twitch",
  "active": true,
  "channel": "channel_id",
  "role": "role_id"
}
```

**Response** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "name": "twitch",
  "active": true,
  "channel": "channel_id",
  "role": "role_id"
}
```

### Update Addon

**PUT** `/addons/update`

Update addon configuration.

**Request Body**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "name": "twitch",
  "active": false,
  "channel": "new_channel_id",
  "role": "new_role_id"
}
```

**Validation**
- `id` must be a valid MongoDB ObjectId
- All fields required with correct types

**Response** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "name": "twitch",
  "active": false,
  "channel": "new_channel_id",
  "role": "new_role_id"
}
```

---

## Settings

Manage per-guild bot settings and moderation configuration.

### Get Settings

**GET** `/settings`

Get configuration settings for a guild.

**Query Parameters**
- `guild_id` (string, required) - Discord guild ID

**Response** `200 OK`

Returns the full settings object.
**Response** `404 Not Found`
```json
{
  "message": "No settings found"
}
```

### Create Settings

**POST** `/settings/add`

Create initial settings for a guild.

**Request Body** - See full schema in main README
```json
{
  "guild_id": "987654321098765432",
  "premium": false,
  "premium_end": null,
  "options": {
    "bang": "!",
    "color": "E7BB41",
    "channels": { ... }
  },
  "moderation": {
    "sharing": false,
    "channels": { ... },
    "limit": { ... },
    "imune": [],
    "roles": { ... },
    "sanctions": { ... }
  }
}
```

**Response** `201 Created`

Returns the full settings object that was created.

---

## Commands

Manage custom bang commands (e.g., `!help`, `!info`).

### Get All Commands

**GET** `/commands`

Get all custom commands for a guild.

**Query Parameters**
- `guild_id` (string, required) - Discord guild ID

**Response** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "guild_id": "987654321098765432",
    "terms": "!help",
    "response": "Need help? Contact staff!",
    "role_id": ""
  }
]
```

### Get Command by ID

**GET** `/commands/id`

Get a specific command by its ID.

**Query Parameters**
- `id` (string, required) - Command MongoDB ObjectId

**Validation**
- `id` must be a valid MongoDB ObjectId

**Response** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "terms": "!help",
  "response": "Need help? Contact staff!"
}
```

**Response** `404 Not Found`
```json
{
  "message": "No command with this _id"
}
```

### Create Command

**POST** `/commands/add`

Create a new custom command.

**Request Body**
```json
{
  "guild_id": "987654321098765432",
  "terms": "!help",
  "response": "Need help? Contact staff!",
  "role_id": "optional_role_id"
}
```

**Validation**
- `guild_id`, `terms`, `response` must be strings
- `role_id` is optional

**Response** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "guild_id": "987654321098765432",
  "terms": "!help",
  "response": "Need help? Contact staff!",
  "role_id": ""
}
```

---

## Emotes

Manage letter-to-emote mappings for the bot.

### Get Emote by Letter

**GET** `/emotes`

Get the emote for a specific letter.

**Query Parameters**
- `letter` (string, required) - Letter to look up

**Response** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "letter": "A",
  "emote": "🅰️"
}
```

**Response** `404 Not Found`
```json
{
  "message": "No emotes found"
}
```

### Get All Emotes

**GET** `/emotes/all`

Get all letter emotes, optionally limited.

**Query Parameters**
- `limit` (number, optional) - Maximum number of results

**Response** `200 OK`
```json
[
  { "_id": "...", "letter": "A", "emote": "🅰️" },
  { "_id": "...", "letter": "B", "emote": "🅱️" }
]
```

### Add Multiple Emotes

**POST** `/emotes/mass`

Bulk create letter emotes.

**Request Body**
```json
{
  "emotes": [
    { "letter": "A", "emote": "🅰️" },
    { "letter": "B", "emote": "🅱️" },
    { "letter": "C", "emote": "©️" }
  ]
}
```

**Response** `201 Created`
```json
{
  "message": "Emotes added"
}
```

---

## Webhooks

### Discord Webhook

**POST** `/discord/webhook`

Receive Discord interaction webhooks.

**Headers**
- `X-Signature-Ed25519` - Ed25519 signature
- `X-Signature-Timestamp` - Request timestamp

**Response** `200 OK` - For ping (type 1)
**Response** `401 Unauthorized` - Invalid signature

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "You must provide all input"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized"
}
```

### 404 Not Found
```json
{
  "message": "This route do not exist"
}
```

### 429 Too Many Requests
```json
{
  "message": "Too many requests, please try again later."
}
```

### 500 Internal Server Error
No body returned (empty response)

---

## Best Practices

1. **Always include authentication header** - All requests require `pastille_botid`
2. **Validate ObjectIds** - Use valid 24-character hex strings for MongoDB IDs
3. **Handle rate limits** - Implement exponential backoff for 429 responses
4. **Check response codes** - Always verify status codes before parsing response
5. **Use bulk operations** - Use `/mass` endpoints for creating multiple records
6. **Type safety** - Ensure request bodies match expected types
7. **Error handling** - Handle 500 errors gracefully (check logs on server)

---

## Changelog

### Version 2.0.0
- Complete API documentation
- Test coverage for all endpoints
- Optimized database queries
- Added validation utilities
- Improved error handling
