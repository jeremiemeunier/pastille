import express, { json, NextFunction, raw, Request, Response } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import lusca from "lusca";
import infractionRoute from "@routes/infraction";
import sanctionRoute from "@routes/sanction";
import dailyuiRoute from "@routes/dailyui";
import twitchpingRoute from "@routes/twitch";
import addonsRoute from "@routes/addons";
import rulesRoute from "@routes/rules";
import rolesRoute from "@routes/roles";
import settingsRoute from "@routes/setting";
import commandsRoute from "@routes/command";
import emotesRoute from "@routes/emote";
import webhookRoute from "@routes/webhook";
import authRoute from "@routes/auth";
import userRoute from "@routes/user";

// Create Express app for testing
export const createTestApp = () => {
  const app = express();

  // Add cookie parser for testing
  app.use(cookieParser());

  // Add session and CSRF token middleware
  // NOTE: cookie.secure: false is allowed ONLY in tests (HTTP). In production, always use HTTPS and cookie.secure: true!
  app.use(session({
    secret: "test_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" } // In production, cookies are only sent over HTTPS.
  }));
  app.use(lusca.csrf());

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
