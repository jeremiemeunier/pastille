import express, { json, NextFunction, raw, Request, Response } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import lusca from "lusca";
import infractionRoute from "@routes/Infraction.route";
import sanctionRoute from "@routes/Sanction.route";
import dailyuiRoute from "@routes/DailyUi.route";
import twitchpingRoute from "@routes/Twitch.route";
import addonsRoute from "@routes/Addon.route";
import rulesRoute from "@routes/Rule.route";
import rolesRoute from "@routes/Role.route";
import settingsRoute from "@routes/Setting.route";
import commandsRoute from "@routes/Command.route";
import emotesRoute from "@routes/Emote.route";
import webhookRoute from "@routes/Webhook.route";
import authRoute from "@routes/Auth.route";
import userRoute from "@routes/User.route";

// Create Express app for testing
export const createTestApp = () => {
  const app = express();

  // Add cookie parser for testing
  app.use(cookieParser());

  // Add session and CSRF token middleware
  // NOTE: cookie.secure: false is allowed ONLY in tests (HTTP). In production, always use HTTPS and cookie.secure: true!
  app.use(
    session({
      secret: "test_secret",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: process.env.NODE_ENV === "production" }, // In production, cookies are only sent over HTTPS.
    })
  );
  
  // Apply CSRF protection conditionally - skip for bot API calls, Bearer tokens, and webhooks
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for bot API calls (identified by pastille_botid header)
    // Skip CSRF for Bearer token authentication (not susceptible to CSRF)
    // Skip CSRF for webhook endpoints
    const authHeader = req.headers.authorization;
    const safePaths = ["/twitch/webhook", "/discord/webhook"];
    if (req.headers.pastille_botid || 
        (authHeader && authHeader.startsWith("Bearer ")) ||
        safePaths.includes(req.path)) {
      next();
    } else {
      lusca.csrf()(req, res, next);
    }
  });

  // Middleware setup - use conditional parsing based on route
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      req.path.startsWith("/twitch/webhook") ||
      req.path.startsWith("/discord/webhook")
    ) {
      raw({ type: "application/json" })(req, res, next);
    } else {
      json()(req, res, next);
    }
  });

  // Routes
  app.use(infractionRoute);
  app.use(sanctionRoute);
  app.use(dailyuiRoute);
  app.use(twitchpingRoute);
  app.use(addonsRoute);
  app.use(rulesRoute);
  app.use(rolesRoute);
  app.use(settingsRoute);
  app.use(commandsRoute);
  app.use(emotesRoute);
  app.use(webhookRoute);
  app.use(authRoute);
  app.use(userRoute);

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ message: "This is pastille" });
  });

  app.all(/(.*)/, (_req: Request, res: Response) => {
    res.status(404).json({ message: "This route do not exist" });
  });

  return app;
};
