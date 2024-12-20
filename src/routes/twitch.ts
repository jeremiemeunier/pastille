import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Twitch from "@models/Twitch";
import Logs from "@libs/Logs";
import Streamers from "@models/Streamers";

const router = Router();

router.get(
  "/twitch/streamers",
  isPastille,
  async (req: Request, res: Response) => {
    try {
      const streamers = await Streamers.find();

      if (streamers.length > 0) {
        res.status(200).json(streamers);
      } else {
        res
          .status(404)
          .json({ message: "No streamer found", http_response: 404 });
      }
    } catch (error: any) {
      Logs("", "error", error);
      res.status(500).json({ message: "An error occured", err: error });
    }
  }
);

router.get("/twitch/live", isPastille, async (req: Request, res: Response) => {
  try {
    const query = await Streamers.find({ isLive: true, isAnnounce: false });

    if (query && query.length > 0) {
      res.status(200).json(query);
    } else {
      res
        .status(404)
        .json({ message: "No live to be announced", http_response: 404 });
    }
  } catch (error: any) {
    Logs("twitch", "error", error);
    res.status(500).json({
      message: "An error occured on getting live and unannounced live",
    });
  }
});

router.get("/twitch", isPastille, async (req: Request, res: Response) => {
  const { guild_id } = req.query;

  try {
    const allTwitchPings = await Twitch.find({ guild_id: { $eq: guild_id } });

    if (allTwitchPings.length > 0) {
      res.status(200).json({
        message: "Find all pings",
        data: allTwitchPings,
      });
    } else {
      res.status(404).json({ message: "Empty pings", http_response: 404 });
    }
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:twitch:get", "error", error, guild_id as string);
  }
});

router.get("/twitch/id", isPastille, async (req: Request, res: Response) => {
  const { id } = req.query;

  try {
    const twitchItem = Twitch.findById({ _id: { $eq: id } });

    if (!twitchItem) {
      res.status(404).json({ message: "Item not found", http_response: 404 });
    }

    res.status(200).json({ message: "Item found", data: twitchItem });
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:twitch:get:id", "error", error);
  }
});

router.post("/twitch/add", isPastille, async (req: Request, res: Response) => {
  const { guild_id, twitch_id, twitch_name, message, progress } = req.body;

  if (!twitch_id || !twitch_name || !guild_id) {
    res.status(400).json({ message: "Must provide a id and name for twitch" });
  } else {
    try {
      const newAddPing = new Twitch({
        guild_id: guild_id,
        twitch: {
          id: twitch_id,
          name: twitch_name,
        },
        message: message || null,
        progress: progress || false,
      });
      await newAddPing.save();
      res
        .status(200)
        .json({ message: "Twitch added to the list", data: newAddPing });
    } catch (error: any) {
      res.status(400).json({ message: "An error occured", error: error });
      Logs("api:twitch:add", "error", error, guild_id);
    }
  }
});

router.delete(
  "/twitch/remove",
  isPastille,
  async (req: Request, res: Response) => {
    const { id } = req.query;

    try {
      await Twitch.findByIdAndDelete({ _id: { $eq: id } });
      res.status(200).json({ message: "Item deleted" });
    } catch (error: any) {
      res.status(400).json({ message: "An error occured", error: error });
      Logs("api:twitch:delete", "error", error);
    }
  }
);

export default router;
