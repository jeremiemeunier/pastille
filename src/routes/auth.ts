import { Request, Response, Router, json } from "express";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import axios from "axios";
import User from "@models/User";
import DiscordAxios from "@utils/DiscordAxios";
import { createSession, revokeSession, revokeAllUserSessions } from "@utils/TokenManager";
import { isAuthenticated } from "@middlewares/isAuthenticated";
import { sanitizeUser } from "@utils/UserSanitizer";

const router = Router();
router.use(json());

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
    // fetching discord auth token
    const request_auth = await DiscordAxios.post("/oauth2/token", params);
    const { access_token, token_type, expires_in, refresh_token, scope } =
      request_auth.data;

    // fetching user data
    const request_data = await DiscordAxios.get("/users/@me", {
      headers: {
        Authorization: `${token_type} ${access_token}`,
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
        res.cookie("pastille_token", session.accessToken, {
          httpOnly: true,
          secure: process.env.DEV !== "1", // Use secure in production
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
          message: "Login successful",
          user: sanitizeUser(q_user),
          expiresAt: session.expiresAt,
        });
      } catch (err: any) {
        Logs("auth.update.user", "error", err);
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
        res.cookie("pastille_token", session.accessToken, {
          httpOnly: true,
          secure: process.env.DEV !== "1", // Use secure in production
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
          message: "Account created successfully",
          user: sanitizeUser(q_make),
          expiresAt: session.expiresAt,
        });
      } catch (err: any) {
        Logs("auth.make.user", "error", err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  } catch (err: any) {
    Logs("auth.login.user", "error", err);

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
router.get("/auth/me", isAuthenticated, async (req: Request, res: Response) => {
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
    Logs("auth.me", "error", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout endpoint
router.post("/auth/logout", isAuthenticated, async (req: Request, res: Response) => {
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

    // Clear cookie
    res.clearCookie("pastille_token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err: any) {
    Logs("auth.logout", "error", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout from all devices
router.post("/auth/logout/all", isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (req.user?.user_id) {
      await revokeAllUserSessions(req.user.user_id);
    }

    // Clear cookie
    res.clearCookie("pastille_token");
    res.status(200).json({ message: "Logged out from all devices" });
  } catch (err: any) {
    Logs("auth.logout.all", "error", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
