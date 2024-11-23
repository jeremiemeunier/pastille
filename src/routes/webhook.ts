import { raw, Router } from "express";
import crypto from "crypto";
import Logs from "@libs/Logs";

const router = Router();

router.post("/twitch/webhook", raw({ type: "*/*" }), async (req, res) => {
  const headers = req.headers;

  const eventsub_messageid = headers["twitch-eventsub-message-id"];
  const eventsub_message_retry = headers["twitch-eventsub-message-retry"];
  const eventsub_message_type = headers["twitch-eventsub-message-type"];
  const eventsub_subscription_type =
    headers["twitch-eventsub-subscription-type"];
  const eventsub_message_timestamp =
    headers["twitch-eventsub-message-timestamp"];
  const eventsub_message_signature =
    headers["twitch-eventsub-message-signature"];
  const hmac_prefix = "sha256=";

  const CheckingSig = (hmac: any, messageSig: any) => {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(messageSig));
  };

  const BuildMessage = (body: any, message_id: any, message_timestamp: any) => {
    return message_id + message_timestamp + body;
  };

  if (
    eventsub_message_timestamp &&
    eventsub_messageid &&
    eventsub_message_signature
  ) {
    const hmacMessage = BuildMessage(
      req.body,
      eventsub_messageid,
      eventsub_message_timestamp
    );
    const hmac = `${hmac_prefix}${crypto
      .createHmac("sha256", process.env.BOT_SECRET_SIG as string)
      .update(hmacMessage)
      .digest("hex")}`;

    if (CheckingSig(hmac, eventsub_message_signature)) {
      Logs("", null, eventsub_message_type as string);
      // signature verified
      // get body
      const notif = JSON.parse(req.body);

      // handle event
      if (eventsub_message_type === "webhook_callback_verification") {
        res.status(200).json({ message: "Valid signature" });
      } else if (eventsub_message_type === "notification") {
        // handle stream online notifications
        const { type } = notif.subscription;
        const { broadcaster_user_id } = notif.event;
      }
    } else {
      res.status(403).json({ message: "Invalid signature" });
    }
  }
});

export default router;
