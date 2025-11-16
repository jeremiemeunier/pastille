import crypto from "crypto";
import Logs from "@libs/Logs";

/**
 * Discord API Cache Utility
 *
 * Provides secure caching for Discord API responses with:
 * - TTL-based expiration
 * - Encryption for sensitive data
 * - Per-user cache isolation
 * - Automatic cleanup
 */

interface CacheEntry {
  data: any;
  encryptedData?: string;
  timestamp: number;
  ttl: number;
  isEncrypted: boolean;
}

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds (optional, will use defaults)
  encrypt?: boolean; // Whether to encrypt the cached data
}

class DiscordCache {
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private encryptionKey: Buffer;

  // Default TTLs for different data types (in milliseconds)
  private readonly DEFAULT_TTLS = {
    USER_DATA: 5 * 60 * 1000, // 5 minutes for user data
    GUILD_DATA: 10 * 60 * 1000, // 10 minutes for guild data
    TOKEN: 30 * 1000, // 30 seconds for OAuth tokens (very short)
  };

  constructor() {
    // Require JWT_SECRET to be set for encryption
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET must be set for DiscordCache encryption to work reliably."
      );
    }
    this.encryptionKey = crypto
      .createHash("sha256")
      .update(process.env.JWT_SECRET)
      .digest();

    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    // Ensure cleanup runs on process exit
    process.once("beforeExit", () => {
      this.clear();
      clearInterval(this.cleanupInterval);
    });
  }

  /**
   * Generate a secure cache key
   * Prevents cache key guessing and ensures user isolation
   */
  private generateKey(namespace: string, identifier: string): string {
    const hash = crypto
      .createHash("sha256")
      .update(
        `${namespace}:${identifier}:${this.encryptionKey.toString("hex")}`
      )
      .digest("hex");
    return hash;
  }

  /**
   * Encrypt sensitive data before caching
   */
  private encrypt(data: any): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        this.encryptionKey,
        iv
      );
      let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
      encrypted += cipher.final("hex");
      return `${iv.toString("hex")}:${encrypted}`;
    } catch (err: any) {
      Logs({
        node: ["cache", "encrypt"],
        state: "error",
        content: err,
      });
      throw new Error("Encryption failed");
    }
  }

  /**
   * Decrypt cached data
   */
  private decrypt(encryptedData: string): any {
    try {
      if (
        !encryptedData ||
        typeof encryptedData !== "string" ||
        !encryptedData.includes(":")
      ) {
        throw new Error("Invalid encrypted data format");
      }
      const parts = encryptedData.split(":");
      if (parts.length !== 2) {
        throw new Error("Invalid encrypted data format");
      }
      const [ivHex, encrypted] = parts;
      if (!ivHex || !encrypted) {
        throw new Error("Missing IV or encrypted data");
      }
      const iv = Buffer.from(ivHex, "hex");
      if (iv.length !== 16) {
        throw new Error("Invalid IV length");
      }
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        this.encryptionKey,
        iv
      );
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return JSON.parse(decrypted);
    } catch (err: any) {
      Logs({
        node: ["cache", "decrypt"],
        state: "error",
        content: err,
      });
      throw new Error("Decryption failed");
    }
  }

  /**
   * Set a value in the cache
   */
  set(
    namespace: string,
    identifier: string,
    data: any,
    config?: CacheConfig
  ): void {
    try {
      if (!namespace || !identifier) {
        Logs({
          node: ["cache", "set"],
          state: "error",
          content: "Namespace and identifier are required",
        });
        return;
      }

      const key = this.generateKey(namespace, identifier);
      const ttl = config?.ttl || this.DEFAULT_TTLS.USER_DATA;
      const encrypt = config?.encrypt ?? false;

      const entry: CacheEntry = {
        data: encrypt ? null : data,
        encryptedData: encrypt ? this.encrypt(data) : undefined,
        timestamp: Date.now(),
        ttl,
        isEncrypted: encrypt,
      };

      this.cache.set(key, entry);

      Logs({
        node: ["cache", "set"],
        state: null,
        content: `Cached ${namespace}${process.env.DEV === "1" ? `:${identifier.substring(0, 8)}...` : ""} (TTL: ${ttl}ms, encrypted: ${encrypt})`,
        devOnly: true,
      });
    } catch (err: any) {
      Logs({
        node: ["cache", "set"],
        state: "error",
        content: err,
      });
      // Don't throw, just log - cache failures shouldn't break the app
    }
  }

  /**
   * Get a value from the cache
   * Returns null if not found or expired
   */
  get(namespace: string, identifier: string): any | null {
    try {
      if (!namespace || !identifier) {
        Logs({
          node: ["cache", "get"],
          state: "error",
          content: "Namespace and identifier are required",
        });
        return null;
      }

      const key = this.generateKey(namespace, identifier);
      const entry = this.cache.get(key);

      if (!entry) {
        return null;
      }

      // Check if entry is expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        Logs({
          node: ["cache", "get"],
          state: null,
          content: `Cache expired for ${namespace}${process.env.DEV === "1" ? `:${identifier.substring(0, 8)}...` : ""}`,
          devOnly: true,
        });
        return null;
      }

      // Return decrypted or plain data
      const data = entry.isEncrypted
        ? entry.encryptedData
          ? this.decrypt(entry.encryptedData)
          : null
        : entry.data;

      if (data === null && entry.isEncrypted) {
        Logs({
          node: ["cache", "get"],
          state: "error",
          content: "Encrypted data is missing",
        });
        this.cache.delete(key);
        return null;
      }

      Logs({
        node: ["cache", "get"],
        state: null,
        content: `Cache hit for ${namespace}${process.env.DEV === "1" ? `:${identifier.substring(0, 8)}...` : ""}`,
        devOnly: true,
      });

      return data;
    } catch (err: any) {
      Logs({
        node: ["cache", "get"],
        state: "error",
        content: err,
      });
      return null;
    }
  }

  /**
   * Delete a specific cache entry
   */
  delete(namespace: string, identifier: string): void {
    try {
      if (!namespace || !identifier) {
        Logs({
          node: ["cache", "delete"],
          state: "error",
          content: "Namespace and identifier are required",
        });
        return;
      }

      const key = this.generateKey(namespace, identifier);
      this.cache.delete(key);
      Logs({
        node: ["cache", "delete"],
        state: null,
        content: `Deleted cache for ${namespace}${process.env.DEV === "1" ? `:${identifier.substring(0, 8)}...` : ""}`,
        devOnly: true,
      });
    } catch (err: any) {
      Logs({
        node: ["cache", "delete"],
        state: "error",
        content: err,
      });
    }
  }

  /**
   * Delete all cache entries for a specific user
   */
  invalidateUser(userId: string): void {
    try {
      // Invalidate user data
      this.delete("user", userId);
      this.delete("guilds", userId);
      Logs({
        node: ["cache", "invalidate"],
        state: null,
        content: `Invalidated all cache for user`,
        devOnly: true,
      });
    } catch (err: any) {
      Logs({
        node: ["cache", "invalidate"],
        state: "error",
        content: err,
      });
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      Logs({
        node: ["cache", "cleanup"],
        state: null,
        content: `Cleaned up ${cleaned} expired entries`,
        devOnly: true,
      });
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    Logs({
      node: ["cache", "clear"],
      state: null,
      content: `Cleared ${size} cache entries`,
      devOnly: true,
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: { namespace: string; count: number }[];
  } {
    return {
      size: this.cache.size,
      entries: [], // Namespace stats not available due to hashed keys
    };
  }
}

// Export singleton instance
export const discordCache = new DiscordCache();
export default discordCache;
