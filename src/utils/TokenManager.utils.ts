import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "@models/Session.model";

// JWT configuration
const JWT_SECRET =
  process.env.JWT_SECRET || crypto.randomBytes(64).toString("hex");
const JWT_EXPIRATION = "7d"; // 7 days
const REFRESH_TOKEN_EXPIRATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

interface TokenPayload {
  user_id: string;
  discord_id: string;
  session_id?: string;
}

/**
 * Generate a secure JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
    issuer: "pastille-bot",
    audience: "pastille-api",
  });
};

/**
 * Generate a secure refresh token
 */
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "pastille-bot",
      audience: "pastille-api",
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Create a new session for a user
 */
export const createSession = async (
  userId: string,
  discordId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> => {
  const accessToken = generateAccessToken({
    user_id: userId,
    discord_id: discordId,
  });
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION);

  // Save session to database
  const session = new Session({
    user_id: userId,
    token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  await session.save();

  return { accessToken, refreshToken, expiresAt };
};

/**
 * Validate session exists and is not expired
 */
export const validateSession = async (token: string): Promise<boolean> => {
  const session = await Session.findOne({
    token,
    expires_at: { $gt: new Date() },
  });
  return !!session;
};

/**
 * Revoke a session (logout)
 */
export const revokeSession = async (token: string): Promise<void> => {
  await Session.deleteOne({ token });
};

/**
 * Revoke all sessions for a user
 */
export const revokeAllUserSessions = async (userId: string): Promise<void> => {
  await Session.deleteMany({ user_id: userId });
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = async (): Promise<void> => {
  await Session.deleteMany({ expires_at: { $lt: new Date() } });
};
