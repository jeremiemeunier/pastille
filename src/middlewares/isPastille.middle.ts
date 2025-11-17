import { NextFunction, Request, Response } from "express";

export const isPastille = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers.pastille_botid === process.env.BOT_ID) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized" });
  }
};
