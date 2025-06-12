import { Router } from "express";
import { isPastille } from "../middlewares/isPastille";
import Emote from "@models/Emote";
import { EmoteTypes } from "@/types/Emote.types";
import Logs from "@libs/Logs";

const router = Router();

router.get("/emotes", isPastille, async (req, res) => {
  const { letter } = req.query;

  try {
    const letterRequest = await Emote.findOne({ letter: { $eq: letter } });

    if (!letterRequest) {
      res.status(404).json({ message: "No emotes", http_response: 404 });
    } else {
      res.status(200).json({ data: letterRequest });
    }
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:emotes:get", "error", error);
  }
});

router.get("/emotes/all", isPastille, async (req, res) => {
  const { limit } = req.query;

  try {
    let allLettersRequest;

    if (limit && parseInt(limit as string) > 0) {
      allLettersRequest = await Emote.find()
        .limit(parseInt(limit as string))
        .sort({ letter: "asc" });
    } else {
      allLettersRequest = await Emote.find().sort({ letter: "asc" });
    }

    if (allLettersRequest.length > 0) {
      res.status(200).json({ data: allLettersRequest });
    } else {
      res.status(404).json({ message: "No letters found", http_response: 404 });
    }
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:emotes:get:all", "error", error);
  }
});

router.post("/emotes/mass", isPastille, async (req, res) => {
  const { emotes } = req.body;

  try {
    emotes.map(async (item: EmoteTypes) => {
      const emoteRegister = new Emote({
        letter: item.letter,
        emote: item.emote,
      });

      try {
        await emoteRegister.save();
      } catch (error: any) {
        Logs("api:emotes:post:save", "error", error);
      }
    });
  } catch (error: any) {
    res.status(400).json({ message: "An error occured", error: error });
    Logs("api:emotes:post:mass", "error", error);
  }
});

export default router;
