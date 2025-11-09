import { Request, Response, Router, json } from "express";
import Logs from "@libs/Logs";
import { rateLimiter } from "@libs/RateLimiter";
import User from "@models/User";
import { isAuthenticated } from "@middlewares/isAuthenticated";
import { sanitizeUser, sanitizeUserPublic } from "@utils/UserSanitizer";

const router = Router();
router.use(json());

// Get user profile by Discord ID (public info only)
router.get("/user/:discord_id", rateLimiter, async (req: Request, res: Response) => {
  try {
    const { discord_id } = req.params;

    if (!discord_id) {
      res.status(400).json({ message: "Discord ID is required" });
      return;
    }

    const user = await User.findOne({ discord_id });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Return only public information
    res.status(200).json({ user: sanitizeUserPublic(user) });
  } catch (err: any) {
    Logs("user.get", "error", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user profile (authenticated)
router.put("/user/profile", isAuthenticated, rateLimiter, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.user_id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Only allow updating non-sensitive fields
    const allowedUpdates = ["global_name", "avatar", "banner", "accent_color"];
    const updates: any = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[`personal.${field}`] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.user_id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: sanitizeUser(updatedUser!),
    });
  } catch (err: any) {
    Logs("user.update", "error", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete user account (authenticated)
router.delete("/user/account", isAuthenticated, rateLimiter, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.user_id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await User.findByIdAndDelete(req.user?.user_id);

    // Clear cookie
    res.clearCookie("pastille_token");
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err: any) {
    Logs("user.delete", "error", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
