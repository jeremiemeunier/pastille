import { UserTypes } from "@/types/User.types";

/**
 * Sanitize user data by removing sensitive fields
 */
export const sanitizeUser = (user: UserTypes): Partial<UserTypes> => {
  const sanitized: Partial<UserTypes> = {
    _id: user._id,
    discord_id: user.discord_id,
    personal: {
      username: user.personal.username,
      global_name: user.personal.global_name,
      avatar: user.personal.avatar,
      banner: user.personal.banner,
      accent_color: user.personal.accent_color,
      verified: user.personal.verified,
      email: "", // Remove email
    },
  };

  // Do not include credentials or private information
  return sanitized;
};

/**
 * Sanitize user data for public display (even more restricted)
 */
export const sanitizeUserPublic = (user: UserTypes): Partial<UserTypes> => {
  return {
    discord_id: user.discord_id,
    personal: {
      username: user.personal.username,
      global_name: user.personal.global_name,
      avatar: user.personal.avatar,
      accent_color: user.personal.accent_color,
      verified: false,
      email: "",
    },
  };
};

/**
 * Check if user has sensitive data fields populated
 */
export const hasSensitiveData = (data: any): boolean => {
  if (!data) return false;

  const sensitiveFields = [
    "credentials",
    "token",
    "refresh_token",
    "email",
    "private",
    "last_login",
    "signup_date",
  ];

  const checkObject = (obj: any, path: string = ""): boolean => {
    for (const key in obj) {
      if (sensitiveFields.includes(key)) {
        return true;
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (checkObject(obj[key], `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  return checkObject(data);
};
