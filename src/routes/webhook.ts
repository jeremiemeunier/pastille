import { raw, Request, Response, Router } from "express";
import crypto from "crypto";
import Logs from "@libs/Logs";
import Streamers from "@models/Streamers";
import { rateLimiter } from "@libs/RateLimiter";

const router = Router();

router.post(
  "/twitch/webhook",
  raw({ type: "*/*" }),
  rateLimiter,
  async (req: Request, res: Response) => {
    const headers = req.headers;

    const message_id = headers["twitch-eventsub-message-id"];
    const message_type = headers["twitch-eventsub-message-type"];
    const message_timestamp = headers["twitch-eventsub-message-timestamp"];
    const message_signature = headers["twitch-eventsub-message-signature"];
    const hmac_prefix = "sha256=";

    const CheckingSig = (hmac: any, messageSig: any) => {
      return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(messageSig));
    };

    const BuildMessage = (
      body: any,
      message_id: any,
      message_timestamp: any
    ) => {
      return message_id + message_timestamp + body;
    };

    if (message_timestamp && message_id && message_signature) {
      const hmacMessage = BuildMessage(req.body, message_id, message_timestamp);
      const hmac = `${hmac_prefix}${crypto
        .createHmac("sha256", process.env.BOT_SECRET_SIG as string)
        .update(hmacMessage)
        .digest("hex")}`;

      if (CheckingSig(hmac, message_signature)) {
        // signature verified
        // get body
        const notif = JSON.parse(req.body);

        // handle event
        if (message_type === "webhook_callback_verification") {
          // updating streamers docs to valid him
          try {
            const broadcasterId = notif.subscription.condition.broadcaster_user_id;
            if (typeof broadcasterId !== "string") {
              res.status(400).json({ message: "Invalid broadcaster_user_id type" });
              return;
            }
            await Streamers.findOneAndUpdate(
              {
                id: { $eq: broadcasterId },
              },
              {
                isValid: true,
                apiSubscriptionId: notif.subscription.id,
              },
              { new: true }
            );
          } catch (err: any) {
            Logs("webhook.twitch", "error", err, "valid_subscription");
          }

          res
            .status(200)
            .set("Content-Type", "text/plain")
            .send(notif.challenge);
        } else if (message_type === "notification") {
          // handle stream online notifications
          const { type } = notif.subscription;
          const { broadcaster_user_id } = notif.event;

          if (type === "stream.online") {
            try {
              // find a streamer with this id
              // update him to indicate is live and unannounced
              const req = await Streamers.findOneAndUpdate(
                { id: { $eq: broadcaster_user_id } },
                { isLive: true, isAnnounce: false },
                { new: true }
              );
            } catch (err: any) {
              Logs("webhook.twitch", "error", err);
            }
          }

          res
            .status(200)
            .set("Content-Type", "text/plain")
            .send(notif.challenge);
        }
      } else {
        res.status(403).json({ message: "Invalid signature" });
      }
    }
  }
);

router.post(
  "/discord/webhook",
  raw({ type: "*/*" }),
  rateLimiter,
  async (req: Request, res: Response) => {
    const signature = req.header("X-Signature-Ed25519");
    const timestamp = req.header("X-Signature-Timestamp");
    const publicKey = process.env.DISCORD_PUBLIC_KEY;
    const body = JSON.parse(req.body);

    if (!signature || !timestamp || !publicKey) {
      res.status(401).json({ message: "Bad request signature" });
      return;
    }

    const isVerified = (() => {
      try {
        const key = crypto.createPublicKey({
          key: Buffer.concat([
            Buffer.from("302a300506032b6570032100", "hex"),
            Buffer.from(publicKey, "hex"),
          ]),
          format: "der",
          type: "spki",
        });

        return crypto.verify(
          null,
          Buffer.concat([Buffer.from(timestamp), req.body]),
          key,
          Buffer.from(signature, "hex")
        );
      } catch (err: any) {
        Logs("webhook.discord", "error", err);
        return false;
      }
    })();

    if (!isVerified) {
      res.status(401).json({ message: "Bad request signature" });
      return;
    }

    if (body.type == 1) {
      res.status(200).json({ type: 1, data: body?.data });
    }

    res.status(204).end();
  }
);

export default router;
