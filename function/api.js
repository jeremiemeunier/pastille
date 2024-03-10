const express = require("express");
const app = express();
const cors = require("cors");
const { logs } = require("../function/logs");
const axios = require("axios");

const api = () => {
  // ##### API SETUP ##### \\
  app.use(express.json());
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

const apiVerifier = async () => {
  try {
    const apiTester = await axios.get("/");
    return true;
  } catch (error) {
    logs("error", "api:tester", error);
    return false;
  }
};

module.exports = { api, apiVerifier };
