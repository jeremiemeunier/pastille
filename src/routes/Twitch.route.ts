import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille.middle";
import Logs from "@libs/Logs";
import Streamers from "@models/Streamer.model";
import { StreamerAnnouncerTypes } from "@/types/Streamers.types";
import { rateLimiter } from "@libs/RateLimiter";

const router = Router();

router.get(
  "/twitch/streamers",
  isPastille,
  rateLimiter,
  async (_, res: Response) => {
    try {
      const q_list = await Streamers.find({ isValid: false });

      if (q_list.length > 0) {
        res.status(200).json(q_list);
        return;
      }

      res.status(404).json({ message: "No streamer found" });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs({ node: ["twitch"], state: "error", content: err });
    }
  }
);

router.get(
  "/twitch/live",
  isPastille,
  rateLimiter,
  async (_req: Request, res: Response) => {
    try {
      const q_get = await Streamers.find({ isLive: true, isAnnounce: false });

      if (q_get && q_get.length > 0) {
        res.status(200).json(q_get);
        return;
      }
      res.status(404).json({ message: "No live to be announced" });
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs({ node: ["twitch"], state: "error", content: err });
    }
  }
);

router.patch(
  "/twitch/streamers/:id",
  isPastille,
  rateLimiter,
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

      res.status(204).end();
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs({ node: ["twitch"], state: "error", content: err });
    }
  }
);

router.post(
  "/twitch/streamers",
  isPastille,
  rateLimiter,
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
      const q_exist = await Streamers.findOne({ id: { $eq: streamer_id } });

      if (q_exist) {
        // we already have this streamer
        // add new recipient
        const recipients = q_exist.announcer;
        recipients.push({
          guild_id: guild_id,
          channel_id: channel_id,
          role_id: role_id,
          message: message ? message : "",
          progress: progress ? progress : false,
        });

        // updating document
        const q_update = await Streamers.findOneAndUpdate(
          {
            id: { $eq: streamer_id },
          },
          {
            announcer: recipients,
          },
          { new: true }
        );
        res.status(201).json(q_update);
      } else {
        // add new streamer
        const q_make = new Streamers({
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

        await q_make.save();
        res.status(201).json(q_make);
      }
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs({
        node: ["twitch"],
        state: "error",
        content: err,
        details: "post_listener",
      });
    }
  }
);

router.delete(
  "/twitch/streamers",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { streamer_id, guild_id } = req.body;

    try {
      const q_exist = await Streamers.findOne({
        id: streamer_id,
        announcer: { $in: [{ guild_id: guild_id }] },
      });

      if (q_exist.announcer.length > 1) {
        // we have many announcer
        const announcers = q_exist.announcer;
        const newAnnouncer = announcers.filter(
          (item: StreamerAnnouncerTypes) => item.guild_id !== guild_id
        );

        const q_update = await Streamers.findOneAndUpdate(
          { id: streamer_id },
          { announcer: newAnnouncer },
          { new: true }
        );
        res.status(201).json(q_update);
      } else {
        // we have only one announcer
        await Streamers.deleteOne({ id: streamer_id });
        res.status(204).end();
      }
    } catch (err: any) {
      res.status(500).json({ message: "Internal server error", error: err });
      Logs({
        node: ["twitch"],
        state: "error",
        content: err,
        details: "post_listener",
      });
    }
  }
);

export default router;
