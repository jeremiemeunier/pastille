import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import Logs from "@libs/Logs";

/**
 * CSRF Protection Middleware using Double Submit Cookie pattern
 *
 * For state-changing operations (POST, PUT, DELETE) when using cookies,
 * this middleware verifies CSRF tokens to prevent cross-site request forgery.
 *
 * Token is expected in:
 * - Header: X-CSRF-Token
 * - Cookie: pastille_csrf (set automatically)
 *
 * Note: Bearer token authentication (Authorization header) is exempt from CSRF checks
 * as it's not susceptible to CSRF attacks.
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "pastille_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a random CSRF token
 */
const generateCsrfToken = (): string => {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
};

/**
 * Middleware to ensure CSRF token exists
 */
export const ensureCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if CSRF token cookie exists
  if (!req.cookies || !req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be accessible to JavaScript for header inclusion
      secure: process.env.DEV !== "1",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
  next();
};

/**
 * Middleware to verify CSRF token for state-changing operations
 *
 * Exempt from CSRF when:
 * - Using Bearer token authentication (not susceptible to CSRF)
 * - Safe methods (GET, HEAD, OPTIONS)
 */
export const verifyCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip CSRF check for safe methods
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  const safePaths = ["/twitch/webhook", "/discord/webhook"];
  if (safeMethods.includes(req.method) || safePaths.includes(req.path)) {
    next();

    if (safePaths.includes(req.path))
      Logs(["csrf", "skip"], null, `Skipping CSRF check for path: ${req.path}`);

    return;
  }

  // Skip CSRF check if using Bearer token (not susceptible to CSRF)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  // For cookie-based auth, verify CSRF token
  const cookieToken = req.cookies ? req.cookies[CSRF_COOKIE_NAME] : null;
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;

  if (!cookieToken) {
    Logs(["csrf", "verification"], "error", "CSRF token missing in cookie");
    res.status(403).json({ message: "CSRF token missing" });
    return;
  }

  if (!headerToken) {
    Logs(["csrf", "verification"], "error", "CSRF token missing in header");
    res.status(403).json({
      message: "CSRF token required in header",
      hint: `Include '${CSRF_HEADER_NAME}' header with value from '${CSRF_COOKIE_NAME}' cookie`,
    });
    return;
  }

  // Verify tokens match
  if (cookieToken !== headerToken) {
    Logs(["csrf", "verification"], "error", "CSRF token mismatch");
    res.status(403).json({ message: "Invalid CSRF token" });
    return;
  }

  next();
};

/**
 * Combined middleware for routes that need CSRF protection
 */
export const csrfProtection = [ensureCsrfToken, verifyCsrfToken];
