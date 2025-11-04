import express, { json, NextFunction, raw, Request, Response } from 'express';
import infractionRoute from '@routes/infraction';
import sanctionRoute from '@routes/sanction';
import dailyuiRoute from '@routes/dailyui';
import twitchpingRoute from '@routes/twitch';
import addonsRoute from '@routes/addons';
import rulesRoute from '@routes/rules';
import rolesRoute from '@routes/roles';
import settingsRoute from '@routes/setting';
import commandsRoute from '@routes/command';
import emotesRoute from '@routes/emote';
import webhookRoute from '@routes/webhook';

// Create Express app for testing
export const createTestApp = () => {
  const app = express();

  // Middleware setup - use conditional parsing based on route
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/twitch/webhook') || req.path.startsWith('/discord/webhook')) {
      raw({ type: 'application/json' })(req, res, next);
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

  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'This is pastille' });
  });

  app.all(/(.*)/, (_req: Request, res: Response) => {
    res.status(404).json({ message: 'This route do not exist', http_response: 404 });
  });

  return app;
};
