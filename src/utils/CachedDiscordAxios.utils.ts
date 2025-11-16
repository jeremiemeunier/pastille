import DiscordAxios from "./DiscordAxios.utils";
import discordCache from "./DiscordCache.utils";
import Logs from "@libs/Logs";
import { AxiosRequestConfig } from "axios";

/**
 * Cached Discord API Client
 *
 * Wrapper around DiscordAxios that provides automatic caching
 * for Discord API responses with security and performance optimizations.
 */

interface CachedRequestOptions extends AxiosRequestConfig {
  cache?: {
    enabled?: boolean; // Whether to use cache (default: true)
    ttl?: number; // Custom TTL in milliseconds
    encrypt?: boolean; // Whether to encrypt cached data
    namespace?: string; // Custom namespace for cache key
  };
  userId?: string; // User ID for cache isolation
}

class CachedDiscordAxios {
  /**
   * Determine if a request should be cached based on endpoint
   */
  private shouldCache(url: string, method: string = "GET"): boolean {
    // Only cache GET requests
    if (method.toUpperCase() !== "GET") {
      return false;
    }

    // Don't cache OAuth token requests (these are unique per code)
    if (url.includes("/oauth2/token")) {
      return false;
    }

    // Cache user and guild data
    return true;
  }

  /**
   * Generate cache namespace based on URL
   */
  private getCacheNamespace(url: string): string {
    if (url.includes("/users/@me/guilds")) {
      return "guilds";
    }
    if (url.includes("/users/@me")) {
      return "user";
    }
    return "discord";
  }

  /**
   * Extract user identifier from request
   */
  private getUserIdentifier(
    url: string,
    config?: CachedRequestOptions
  ): string | null {
    // If userId is provided explicitly, use it
    if (config?.userId) {
      return config.userId;
    }

    // Don't use authorization header as identifier - require explicit userId
    return null;
  }

  /**
   * Determine cache TTL based on data type
   */
  private getCacheTTL(url: string): number {
    if (url.includes("/users/@me/guilds")) {
      return 30 * 60 * 1000; // 30 minutes for guild data
    }
    if (url.includes("/users/@me")) {
      return 60 * 60 * 1000; // 60 minutes for user data
    }
    return 5 * 60 * 1000; // Default 5 minutes
  }

  /**
   * Determine if data should be encrypted
   */
  private shouldEncrypt(url: string): boolean {
    // Encrypt user personal data only
    if (url.includes("/users/@me") && !url.includes("/guilds")) {
      return true;
    }
    return false;
  }

  /**
   * GET request with caching
   */
  async get(url: string, config?: CachedRequestOptions): Promise<any> {
    const cacheEnabled = config?.cache?.enabled ?? true;
    const shouldCache = this.shouldCache(url, "GET") && cacheEnabled;

    if (shouldCache) {
      const namespace = config?.cache?.namespace || this.getCacheNamespace(url);
      const identifier = this.getUserIdentifier(url, config);

      if (identifier) {
        // Try to get from cache
        const cached = discordCache.get(namespace, identifier);
        if (cached) {
          Logs({
            node: ["discord", "api", "cached"],
            state: null,
            content: `Returning cached data for ${url}`,
            devOnly: true,
          });
          return { data: cached };
        }
      }
    }

    // Make actual API request
    try {
      const response = await DiscordAxios.get(url, config);

      // Cache the response if applicable
      if (shouldCache) {
        const namespace =
          config?.cache?.namespace || this.getCacheNamespace(url);
        const identifier = this.getUserIdentifier(url, config);

        if (identifier) {
          const ttl = config?.cache?.ttl || this.getCacheTTL(url);
          const encrypt = config?.cache?.encrypt ?? this.shouldEncrypt(url);

          discordCache.set(namespace, identifier, response.data, {
            ttl,
            encrypt,
          });
        }
      }

      return response;
    } catch (err: any) {
      Logs({ node: ["discord", "api", "error"], state: "error", content: err });
      throw err;
    }
  }

  /**
   * POST request (no caching)
   */
  async post(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    return DiscordAxios.post(url, data, config);
  }

  /**
   * PUT request (no caching)
   */
  async put(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    return DiscordAxios.put(url, data, config);
  }

  /**
   * DELETE request (no caching)
   */
  async delete(url: string, config?: AxiosRequestConfig): Promise<any> {
    return DiscordAxios.delete(url, config);
  }

  /**
   * PATCH request (no caching)
   */
  async patch(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    return DiscordAxios.patch(url, data, config);
  }

  /**
   * Invalidate cache for a specific user
   */
  invalidateUserCache(userId: string): void {
    discordCache.invalidateUser(userId);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    discordCache.clear();
  }
}

// Export singleton instance
export const cachedDiscordAxios = new CachedDiscordAxios();
export default cachedDiscordAxios;
