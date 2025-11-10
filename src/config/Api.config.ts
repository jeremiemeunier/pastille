import { json, NextFunction, raw, Request, Response } from "express";
import Logs from "@libs/Logs";
import App from "@libs/App";

import { default as infractionRoute } from "@routes/Infraction.route";
import { default as sanctionRoute } from "@routes/Sanction.route";
import { default as dailyuiRoute } from "@routes/DailyUi.route";
import { default as twitchpingRoute } from "@routes/Twitch.route";
import { default as addonsRoute } from "@routes/Addon.route";
import { default as rulesRoute } from "@routes/Rule.route";
import { default as rolesRoute } from "@routes/Role.route";
import { default as settingsRoute } from "@routes/Setting.route";
import { default as commandsRoute } from "@routes/Command.route";
import { default as emotesRoute } from "@routes/Emote.route";
import { default as webhookRoute } from "@routes/Webhook.route";
import { default as authRoute } from "@routes/Auth.route";
import { default as userRoute } from "@routes/User.route";

const Api = () => {
  // API

  App.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.startsWith("/twitch/webhook")) {
      App.use(raw({ type: "application/json" }));
    } else {
      App.use(json());
    }

    next();
  });

  App.use(infractionRoute);
  App.use(sanctionRoute);
  App.use(dailyuiRoute);
  App.use(twitchpingRoute);
  App.use(addonsRoute);
  App.use(rulesRoute);
  App.use(rolesRoute);
  App.use(settingsRoute);
  App.use(commandsRoute);
  App.use(emotesRoute);
  App.use(webhookRoute);
  App.use(authRoute);
  App.use(userRoute);

  App.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ message: "This is pastille" });
  });

  App.all(/(.*)/, (_req: Request, res: Response) => {
    res.status(404).json({ message: "This route do not exist" });
  });

  App.listen(3000, () => {
    Logs(["api"], "start", `Started on port 3000`);
  });
};

export default Api;
