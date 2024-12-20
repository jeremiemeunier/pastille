import { raw, Router } from "express";
import crypto from "crypto";
import Logs from "@libs/Logs";
import Streamers from "@models/Streamers";

const router = Router();

router.post("/twitch/webhook", raw({ type: "*/*" }), async (req, res) => {
  const headers = req.headers;

  const message_id = headers["twitch-eventsub-message-id"];
  const message_type = headers["twitch-eventsub-message-type"];
  const message_timestamp = headers["twitch-eventsub-message-timestamp"];
  const message_signature = headers["twitch-eventsub-message-signature"];
  const hmac_prefix = "sha256=";

  const CheckingSig = (hmac: any, messageSig: any) => {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(messageSig));
  };

  const BuildMessage = (body: any, message_id: any, message_timestamp: any) => {
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
        Logs("webhook", null, notif, "validating");
        res.status(200).set("Content-Type", "text/plain").send(notif.challenge);
      } else if (message_type === "notification") {
        // handle stream online notifications
        const { type } = notif.subscription;
        const { broadcaster_user_id } = notif.event;

        if (type === "stream.online") {
          try {
            // find a streamer with this id
            // update him to indicate is live and unannounced
            const req = await Streamers.findOneAndUpdate(
              { id: broadcaster_user_id },
              { isLive: true, isAnnounce: false },
              { new: true }
            );
          } catch (error: any) {
            Logs("webhook", "error", error);
          }
        }

        res.status(200).set("Content-Type", "text/plain").send(notif.challenge);
      }
    } else {
      res.status(403).json({ message: "Invalid signature" });
    }
  }
});

export default router;
