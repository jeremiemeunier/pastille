import { json, NextFunction, raw, Request, Response } from "express";
import Logs from "@libs/Logs";
import App from "@libs/App";

import { default as infractionRoute } from "@routes/infraction";
import { default as sanctionRoute } from "@routes/sanction";
import { default as dailyuiRoute } from "@routes/dailyui";
import { default as twitchpingRoute } from "@routes/twitch";
import { default as addonsRoute } from "@routes/addons";
import { default as rulesRoute } from "@routes/rules";
import { default as rolesRoute } from "@routes/roles";
import { default as settingsRoute } from "@routes/setting";
import { default as commandsRoute } from "@routes/command";
import { default as emotesRoute } from "@routes/emote";
import { default as webhookRoute } from "@routes/webhook";

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

  App.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ message: "This is pastille" });
  });

  App.all(/(.*)/, (_req: Request, res: Response) => {
    res
      .status(404)
      .json({ message: "This route do not exist", http_response: 404 });
  });

  App.listen(3000, () => {
    Logs("api", "start", `Started on port 3000`);
  });
};

export default Api;
