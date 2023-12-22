const api = () => {

  // ##### API SETUP ##### \\
  const express = require("express");
  const app = express();
  const RateLimit = require('express-rate-limit');
  const cors = require("cors");
  const { logs } = require('../function/logs');

  const limiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });

  app.use(limiter);
  app.use(express.json());
  app.use(cors());

  // API
  const infractionRoute = require('../routes/infraction');
  const sanctionRoute = require('../routes/sanction');
  const dailyuiRoute = require('../routes/dailyui');
  const twitchpingRoute = require('../routes/twitch');
  const addonsRoute = require('../routes/addons');
  const rulesRoute = require('../routes/rules');

  app.use(infractionRoute);
  app.use(sanctionRoute);
  app.use(dailyuiRoute);
  app.use(twitchpingRoute);
  app.use(addonsRoute);
  app.use(rulesRoute);

  app.get("/", (req, res) => { res.status(200).json({ message: "Bienvenue sur le Backend de Pastille" }); });
  app.all("*", (req, res) => { res.status(404).json({ message: "This route do not exist" }); });
  app.listen(3000, () => { logs('start', 'api', `Started on port 3000`); });
}

module.exports = { api }