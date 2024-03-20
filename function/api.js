import express, { json } from "express";
import cors from "cors";
import { logs } from "../function/logs";
import axios from "axios";
import { isPastille } from "../middlewares/isPastille";

const app = express();

export const api = () => {
  // ##### API SETUP ##### \\
  app.use(json());
  app.use(cors());

  // Setup of axios
  axios.defaults.baseURL = "http://localhost:3000";

  // API
  const infractionRoute = require("../routes/infraction");
  const sanctionRoute = require("../routes/sanction");
  const dailyuiRoute = require("../routes/dailyui");
  const twitchpingRoute = require("../routes/twitch");
  const addonsRoute = require("../routes/addons");
  const rulesRoute = require("../routes/rules");
  const rolesRoute = require("../routes/roles");
  const settingsRoute = require("../routes/setting");
  const commandsRoute = require("../routes/command");
  const emotesRoute = require("../routes/emote");

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
