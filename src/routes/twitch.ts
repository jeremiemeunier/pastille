import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Twitch from "@models/Twitch";
import Logs from "@libs/Logs";
import Streamers from "@models/Streamers";
import { StreamerAnnouncerTypes } from "@/types/Streamers.types";
import { InferAttributes } from "sequelize";

const router = Router();

router.get(
  "/twitch/streamers",
  isPastille,
  async (_req: Request, res: Response) => {
    try {
      const streamers = await Streamers.find({ isValid: false });

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

router.get("/twitch/live", isPastille, async (_req: Request, res: Response) => {
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

import rateLimit from "express-rate-limit";

const patchStreamerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later." },
});

router.patch(
  "/twitch/streamers/:id",
  isPastille,
  patchStreamerLimiter,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await Streamers.findByIdAndUpdate(
        { _id: id },
        {
          isValid: true,
        },
        { new: true }
      );

      res.status(200).json({ message: "streamers entry has been updated" });
    } catch (err: any) {
      Logs("twitch", "error", err);
      res
        .status(500)
        .json({
          message: "An error occured on updating streamers isValid entry",
        });
    }
  }
);

router.post(
  "/twitch/streamers",
  isPastille,
  async (req: Request, res: Response) => {
    const {
      streamer_id,
      streamer_name,
      guild_id,
      channel_id,
      role_id,
      message,
      progress,
    } = req.body;

    try {
      const isRegistred = await Streamers.findOne({ id: streamer_id });

      if (isRegistred) {
        // we already have this streamer
        // add new recipient
        const recipients = isRegistred.announcer;
        recipients.push({
          guild_id: guild_id,
          channel_id: channel_id,
          role_id: role_id,
          message: message ? message : "",
          progress: progress ? progress : false,
        });

        // updating document
        const updatedDoc = await Streamers.findOneAndUpdate(
          {
            id: streamer_id,
          },
          {
            announcer: recipients,
          },
          { new: true }
        );
        res.status(201).json(updatedDoc);
      } else {
        // add new streamer
        const newDocs = new Streamers({
          id: streamer_id,
          name: streamer_name,
          isLive: false,
          isAnnounce: false,
          isValid: false,
          announcer: [
            {
              guild_id: guild_id,
              channel_id: channel_id,
              role_id: role_id,
              message: message ? message : "",
              progress: progress ? progress : false,
            },
          ],
        });

        await newDocs.save();
        res.status(201).json(newDocs);
      }
    } catch (error: any) {
      Logs("", "error", error, "post_listener");
      res.status(500).json({ message: "An error occured on listener adding" });
    }
  }
);

router.delete(
  "/twitch/streamers",
  isPastille,
  async (req: Request, res: Response) => {
    const { streamer_id, guild_id } = req.body;

    try {
      const isRegistred = await Streamers.findOne({
        id: streamer_id,
        announcer: { $in: [{ guild_id: guild_id }] },
      });

      if (isRegistred.announcer.length > 1) {
        // we have many announcer
        const announcers = isRegistred.announcer;
        const newAnnouncer = announcers.filter(
          (item: StreamerAnnouncerTypes) => item.guild_id !== guild_id
        );

        const updatedDoc = await Streamers.findOneAndUpdate(
          { id: streamer_id },
          { announcer: newAnnouncer },
          { new: true }
        );
        res.status(201).json(updatedDoc);
      } else {
        // we have only one announcer
        await Streamers.deleteOne({ id: streamer_id });
        res
          .status(200)
          .json({ message: "Document has been removed successfully" });
      }
    } catch (error: any) {
      Logs("", "error", error, "post_listener");
      res.status(500).json({ message: "An error occured on listener adding" });
    }
  }
);

export default router;
