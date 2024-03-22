import express, { json } from "express";
import cors from "cors";
import { logs } from "../function/logs";
import axios from "axios";
import { isPastille } from "../middlewares/isPastille";

import infractionRoute from "../routes/infraction";
import sanctionRoute from "../routes/sanction";
import dailyuiRoute from "../routes/dailyui";
import twitchpingRoute from "../routes/twitch";
import addonsRoute from "../routes/addons";
import rulesRoute from "../routes/rules";
import rolesRoute from "../routes/roles";
import settingsRoute from "../routes/setting";
import commandsRoute from "../routes/command";
import emotesRoute from "../routes/emote";

const app = express();

export const api = () => {
  // ##### API SETUP ##### \\
  app.use(json());
  app.use(cors());

  // Setup of axios
  axios.defaults.baseURL = "http://localhost:3000";

  // API
  app.use(infractionRoute, isPastille);
  app.use(sanctionRoute, isPastille);
  app.use(dailyuiRoute, isPastille);
  app.use(twitchpingRoute, isPastille);
  app.use(addonsRoute, isPastille);
  app.use(rulesRoute, isPastille);
  app.use(rolesRoute, isPastille);
  app.use(settingsRoute, isPastille);
  app.use(commandsRoute, isPastille);
  app.use(emotesRoute, isPastille);

  app.get("/", (req, res) => {
    res.status(200).json({ message: "Bienvenue sur le Backend de Pastille" });
  });
  app.all("*", (req, res) => {
    res.status(404).json({ message: "This route do not exist" });
  });
  app.listen(3000, () => {
    logs("start", "api", `Started on port 3000`);
  });
};
