import { Router } from "express";
const router = Router();
import Emote, { findOne, find } from "../model/Emote";
import isPastille from "../middlewares/isPastille";
import { logs } from "../function/logs";

router.get("/emotes", isPastille, async (req, res) => {
  const { letter } = req.query;

  try {
    const letterRequest = await findOne({ letter: { $eq: letter } });

    if (letterRequest) {
      res.status(404).json({ message: "No emotes" });
    } else {
      res.status(200).json({ data: letterRequest });
    }
  } catch (error) {
    res.status(400).json({ message: "An error occured", error: error });
    logs("error", "api:emotes:get", error);
  }
});

router.get("/emotes/all", isPastille, async (req, res) => {
  const { limit } = req.query;

  try {
    let allLettersRequest;

    if (limit > 0) {
      allLettersRequest = await find().limit(limit).sort({ letter: "asc" });
    } else {
      allLettersRequest = await find().sort({ letter: "asc" });
    }

    if (allLettersRequest.length > 0) {
      res.status(200).json({ data: allLettersRequest });
    } else {
      res.status(404).json({ message: "No letters found" });
    }
  } catch (error) {
    res.status(400).json({ message: "An error occured", error: error });
    logs("error", "api:emotes:get:all", error);
  }
});

router.post("/emotes/mass", isPastille, async (req, res) => {
  const { emotes } = req.body;

  try {
    emotes.map(async (item) => {
      const emoteRegister = new Emote({
        letter: item.letter,
        emote: item.emote,
      });

      try {
        await emoteRegister.save();
      } catch (error) {
        logs("error", "api:emotes:post:save", error);
      }
    });
  } catch (error) {
    res.status(400).json({ message: "An error occured", error: error });
    logs("error", "api:emotes:post:mass", error);
  }
});

export default router;
