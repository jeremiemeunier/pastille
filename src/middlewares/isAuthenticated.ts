import { NextFunction, Request, Response } from "express";
import { verifyToken, validateSession } from "@utils/TokenManager";
import Logs from "@libs/Logs";

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        discord_id: string;
        session_id?: string;
      };
    }
  }
}

/**
 * Middleware to authenticate user via JWT token
 * Token can be provided in:
 * 1. Authorization header as "Bearer <token>"
 * 2. Cookie named "pastille_token"
 */
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Check cookie if no header token
    if (!token && req.cookies && req.cookies.pastille_token) {
      token = req.cookies.pastille_token;
    }

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    // Validate session exists in database
    const isValidSession = await validateSession(token);
    if (!isValidSession) {
      res.status(401).json({ message: "Session expired or invalid" });
      return;
    }

    // Attach user info to request
    req.user = {
      user_id: decoded.user_id,
      discord_id: decoded.discord_id,
      session_id: decoded.session_id,
    };

    next();
  } catch (err: any) {
    Logs("middleware:isAuthenticated", "error", err);
    res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Optional authentication - doesn't reject if no token
 * but populates req.user if valid token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Check cookie if no header token
    if (!token && req.cookies && req.cookies.pastille_token) {
      token = req.cookies.pastille_token;
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const isValidSession = await validateSession(token);
        if (isValidSession) {
          req.user = {
            user_id: decoded.user_id,
            discord_id: decoded.discord_id,
            session_id: decoded.session_id,
          };
        }
      }
    }

    next();
  } catch (err: any) {
    Logs("middleware:optionalAuth", "error", err);
    next(); // Continue even on error for optional auth
  }
};
