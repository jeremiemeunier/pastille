import { Request, Response } from "express";
import { isPastille } from "@middlewares/isPastille";
import Logs from "@libs/Logs";
import App from "@libs/App";

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

const Api = () => {
  // API
  App.use(infractionRoute, isPastille);
  App.use(sanctionRoute, isPastille);
  App.use(dailyuiRoute, isPastille);
  App.use(twitchpingRoute, isPastille);
  App.use(addonsRoute, isPastille);
  App.use(rulesRoute, isPastille);
  App.use(rolesRoute, isPastille);
  App.use(settingsRoute, isPastille);
  App.use(commandsRoute, isPastille);
  App.use(emotesRoute, isPastille);

  App.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ message: "This is pastille" });
  });
  App.all("*", (_req: Request, res: Response) => {
    res.status(404).json({ message: "This route do not exist" });
  });
  App.listen(3000, () => {
    Logs("api", "start", `Started on port 3000`);
  });
};

export default Api;
