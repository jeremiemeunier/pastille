import { Request, Response, Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Command from "@models/Command";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";

const router = Router();

router.get("/commands", isPastille, async (req: Request, res: Response) => {
  const { guild_id } = req.query;

  try {
    const allCommandsRequest = await Command.find({
      guild_id: guild_id,
    });

    if (allCommandsRequest.length === 0) {
      res.status(404).json({ message: "No commands", http_response: 404 });
    } else {
      res.status(200).json({ data: allCommandsRequest });
    }
  } catch (err: any) {
    res.status(500).end();
    Logs("api:commands:get", "error", err);
  }
});

router.get("/commands/id", isPastille, async (req: Request, res: Response) => {
  const { id } = req.query;

  try {
    const commandRequest = await Command.findById({ _id: id });

    if (!commandRequest) {
      res
        .status(404)
        .json({ message: "No command with this _id", http_response: 404 });
    } else {
      res.status(200).json({ data: commandRequest });
    }
  } catch (err: any) {
    res.status(500).end();
    Logs("api:commands:get", "error", err);
  }
});

router.post(
  "/commands/add",
  isPastille,
  rateLimiter,
  async (req: Request, res: Response) => {
    const { terms, guild_id, response, role_id } = req.body;

    if (!terms || !guild_id || !response) {
      res.status(400).json({ message: "You must provide all inputs" });
    } else {
      try {
        const newCommandsRegister = new Command({
          guild_id: guild_id,
          role_id: role_id ? role_id : "",
          terms: terms,
          response: response,
        });

        await newCommandsRegister.save();
        res
          .status(200)
          .json({ message: "New command added", data: newCommandsRegister });
      } catch (err: any) {
        res.status(500).end();
        Logs("api:commands:add", "error", err, guild_id);
      }
    }
  }
);

export default router;
