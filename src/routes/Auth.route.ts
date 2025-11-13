import { Request, Response, Router, json } from "express";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import User from "@models/User.model";
import Guild from "@models/Guild.model";
import DiscordAxios from "@utils/DiscordAxios.utils";
import cachedDiscordAxios from "@utils/CachedDiscordAxios.utils";
import {
  createSession,
  revokeSession,
  revokeAllUserSessions,
} from "@utils/TokenManager.utils";
import { isAuthenticated } from "@middlewares/isAuthenticated";
import { sanitizeUser } from "@utils/UserSanitizer.utils";
import { ensureCsrfToken } from "@middlewares/csrfProtection";

const router = Router();
router.use(json());

// Ensure CSRF token is set for all auth routes
router.use(ensureCsrfToken);

router.post("/auth/login", rateLimiter, async (req: Request, res: Response) => {
  if (!req.body) {
    res.status(400).json({ message: "You must provide a body" });
    return;
  }

  const params = new URLSearchParams();
  const { code } = req.body;

  if (!code) {
    res.status(400).json({ message: "You must provide a code" });
    return;
  }

  // build params
  params.append("grant_type", "authorization_code");
  params.append("client_id", process.env.DISCORD_CLIENT as string);
  params.append("client_secret", process.env.DISCORD_SECRET as string);
  params.append("code", code);

  if (process.env.DEV === "1") {
    params.append("redirect_uri", "http://localhost:5280/auth/login");
  } else {
    params.append(
      "redirect_uri",
      "https://pastille.jeremiemeunier.fr/auth/login"
    );
  }

  try {
    // fetching discord auth token (not cached - one-time use code)
    const request_auth = await DiscordAxios.post("/oauth2/token", params);
    const { access_token, token_type, expires_in, refresh_token, scope } =
      request_auth.data;

    // fetching user data (not cached on login - userId not available yet)
    const request_data = await cachedDiscordAxios.get("/users/@me", {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
      cache: {
        enabled: false, // Can't cache without userId
      },
    });

    // return when cannot fetch user data
    if (!request_data.data) {
      res.status(500).json({ message: "Unable to fetch user data" });
      return;
    }

    // find or create user in database
    const q_user = await User.findOne({ discord_id: request_data.data.id });

    if (q_user) {
      const { data } = request_data;
      /**
       * user exists
       *  - update credentials and last login
       *  - make a session token
       *  - send cookie/token without body
       */

      try {
        await User.findByIdAndUpdate(q_user._id, {
          personal: {
            global_name: data.global_name,
            avatar: data.avatar,
            banner: data.banner,
            accent_color: data.accent_color,
            verified: data.verified,
          },
          credentials: {
            token: access_token,
            refresh_token: refresh_token,
            expires_in: expires_in,
            scope: scope,
            token_type: token_type,
          },
          private: {
            last_login: new Date().toISOString(),
          },
        });

        // Create session token and send it as cookie
        const session = await createSession(
          q_user._id.toString(),
          data.id,
          req.ip,
          req.headers["user-agent"]
        );

        // Set secure httpOnly cookie
        res
          .cookie("pastille_token", session.accessToken, {
            httpOnly: true,
            secure: process.env.DEV !== "1", // Use secure in production
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          })
          .status(204)
          .end();
      } catch (err: any) {
        Logs(["auth", "update", "user"], "error", err);
        res.status(500).json({ message: "Internal server error" });
      }
    } else {
      const { data } = request_data;
      /**
       * user does not exist
       *  - create user with credentials and last login
       *  - make a session token
       *  - send cookie/token without body
       */
      try {
        const q_make = new User({
          discord_id: data.id,
          personal: {
            email: data.email,
            username: data.username,
            global_name: data.global_name,
            avatar: data.avatar,
            banner: data.banner,
            accent_color: data.accent_color,
            verified: data.verified,
          },
          credentials: {
            token: access_token,
            refresh_token: refresh_token,
            expires_in: expires_in,
            token_type: token_type,
          },
          private: {
            last_login: new Date().toISOString(),
            signup_date: new Date().toISOString(),
          },
        });

        await q_make.save();

        // Create session token and send it as cookie
        const session = await createSession(
          q_make._id.toString(),
          data.id,
          req.ip,
          req.headers["user-agent"]
        );

        // Set secure httpOnly cookie
        res
          .cookie("pastille_token", session.accessToken, {
            httpOnly: true,
            secure: process.env.DEV !== "1", // Use secure in production
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          })
          .status(204)
          .end();
      } catch (err: any) {
        Logs(["auth", "make", "user"], "error", err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  } catch (err: any) {
    Logs(["auth", "login", "user"], "error", err);

    if (err?.error === "invalid_grant") {
      res.status(400).json({ message: "Invalid code", error: err?.error });
      return;
    }

    res
      .status(500)
      .json({ message: "Internal server error", error: err?.error });
    return;
  }
});

// Get current user information
router.get(
  "/auth/me",
  rateLimiter,
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.user?.user_id);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      Logs(["auth", "me"], "error", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Logout endpoint
router.post(
  "/auth/logout",
  rateLimiter,
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      // Get token from cookie or header
      let token: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
      if (!token && req.cookies && req.cookies.pastille_token) {
        token = req.cookies.pastille_token;
      }

      if (token) {
        await revokeSession(token);
      }

      // Invalidate Discord API cache for this user
      if (req.user?.discord_id) {
        cachedDiscordAxios.invalidateUserCache(req.user.discord_id);
      }

      // Clear cookie
      res.clearCookie("pastille_token");
      res.status(200).json({ message: "Logged out successfully" });
    } catch (err: any) {
      Logs(["auth", "logout"], "error", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Logout from all devices
router.post(
  "/auth/logout/all",
  rateLimiter,
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      if (req.user?.user_id) {
        await revokeAllUserSessions(req.user.user_id);
      }

      // Invalidate Discord API cache for this user
      if (req.user?.discord_id) {
        cachedDiscordAxios.invalidateUserCache(req.user.discord_id);
      }

      // Clear cookie
      res.clearCookie("pastille_token");
      res.status(200).json({ message: "Logged out from all devices" });
    } catch (err: any) {
      Logs(["auth", "logout", "all"], "error", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get user's Discord guilds where they can add bots
router.get(
  "/auth/guilds",
  rateLimiter,
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.user?.user_id);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Fetch user's guilds from Discord API (cached)
      const guildsResponse = await cachedDiscordAxios.get("/users/@me/guilds", {
        headers: {
          Authorization: `${user.credentials.token_type} ${user.credentials.token}`,
        },
        userId: user.discord_id, // For cache isolation
      });

      if (!guildsResponse.data) {
        res.status(500).json({ message: "Unable to fetch guilds" });
        return;
      }

      // Filter guilds where user has MANAGE_GUILD permission (0x00000020 = 32)
      // This is the permission required to add bots to a server
      const MANAGE_GUILD = 0x00000020;
      const guildsWhereUserCanAddBot = guildsResponse.data.filter(
        (guild: any) => {
          // Check if user has MANAGE_GUILD permission
          // permissions is a string representation of a bitfield
          const permissions = parseInt(guild.permissions);
          return (permissions & MANAGE_GUILD) === MANAGE_GUILD;
        }
      );

      if (guildsWhereUserCanAddBot.length === 0) {
        res
          .status(404)
          .json({ message: "No guilds found where you can add the bot" });
        return;
      }

      // Check which guilds the bot is already in
      const botGuildIds = await Guild.find({
        id: { $in: guildsWhereUserCanAddBot.map((g: any) => g.id) },
      }).select("id");

      const botGuildIdsSet = new Set(botGuildIds.map((g) => g.id));

      // Map guilds to include only necessary information and bot presence
      const mappedGuilds = guildsWhereUserCanAddBot.map((guild: any) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        description: guild.description,
        owner: guild.owner,
        botAdded: botGuildIdsSet.has(guild.id),
      }));

      // Add guild to user
      await User.findByIdAndUpdate(user._id, {
        guilds: mappedGuilds,
      });

      res.status(200).json(mappedGuilds);
    } catch (err: any) {
      Logs(["auth", "guilds"], "error", err);

      // Check if the error is due to invalid/expired Discord token
      if (err?.code === 0 || err?.message === "401: Unauthorized") {
        res.status(401).json({
          message: "Discord token expired or invalid",
          error: "unauthorized",
          details: "Please log in again to refresh your Discord token",
        });
        return;
      }

      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
