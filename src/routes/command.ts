import { Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Command from "@models/Command";
import Logs from "@libs/Logs";

const router = Router();

router.get("/commands", isPastille, async (req, res) => {
  const { guild_id } = req.query;

  try {
    const allCommandsRequest = await Command.find({
      guild_id: guild_id,
    });

    if (allCommandsRequest.length === 0) {
      res.status(404).json({ message: "No commands" });
    } else {
      res.status(200).json({ data: allCommandsRequest });
    }
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:commands:get", "error", error);
  }
});

router.get("/commands/id", isPastille, async (req, res) => {
  const { id } = req.query;

  try {
    const commandRequest = await Command.findById({ _id: id });

    if (!commandRequest) {
      res.status(404).json({ message: "No command with this _id" });
    } else {
      res.status(200).json({ data: commandRequest });
    }
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:commands:get", "error", error);
  }
});

router.post("/commands/add", isPastille, async (req, res) => {
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
    } catch (error: any) {
      res.status(400).json({ message: "An error occured", error: error });
      Logs("api:commands:add", "error", error, guild_id);
    }
  }
});

export default router;
