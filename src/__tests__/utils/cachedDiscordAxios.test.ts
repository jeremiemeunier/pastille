import cachedDiscordAxios from "@utils/CachedDiscordAxios.utils";
import DiscordAxios from "@utils/DiscordAxios.utils";
import discordCache from "@utils/DiscordCache.utils";

// Mock dependencies
jest.mock("@utils/DiscordAxios.utils");
jest.mock("@utils/DiscordCache.utils");

describe("CachedDiscordAxios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset cache mock
    (discordCache.get as jest.Mock).mockReturnValue(null);
    (discordCache.set as jest.Mock).mockImplementation(() => {});
    (discordCache.delete as jest.Mock).mockImplementation(() => {});
    (discordCache.invalidateUser as jest.Mock).mockImplementation(() => {});
    (discordCache.clear as jest.Mock).mockImplementation(() => {});
  });

  describe("GET requests with caching", () => {
    it("should fetch from API on cache miss", async () => {
      const mockData = { id: "123", username: "testuser" };
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockData });
      (discordCache.get as jest.Mock).mockReturnValue(null);

      const result = await cachedDiscordAxios.get("/users/@me", {
        headers: { Authorization: "Bearer token123" },
        userId: "user123",
      });

      expect(DiscordAxios.get).toHaveBeenCalledWith("/users/@me", {
        headers: { Authorization: "Bearer token123" },
        userId: "user123",
      });
      expect(result.data).toEqual(mockData);
      expect(discordCache.set).toHaveBeenCalled();
    });

    it("should return cached data on cache hit", async () => {
      const cachedData = { id: "123", username: "cached" };
      (discordCache.get as jest.Mock).mockReturnValue(cachedData);

      const result = await cachedDiscordAxios.get("/users/@me", {
        headers: { Authorization: "Bearer token123" },
        userId: "user123",
      });

      expect(DiscordAxios.get).not.toHaveBeenCalled();
      expect(result.data).toEqual(cachedData);
    });

    it("should cache user data with encryption", async () => {
      const mockData = { id: "123", email: "user@example.com" };
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockData });
      (discordCache.get as jest.Mock).mockReturnValue(null);

      await cachedDiscordAxios.get("/users/@me", {
        headers: { Authorization: "Bearer token123" },
        userId: "user123",
      });

      expect(discordCache.set).toHaveBeenCalledWith(
        "user",
        expect.anything(),
        mockData,
        expect.objectContaining({ encrypt: true })
      );
    });

    it("should cache guild data without encryption", async () => {
      const mockData = [{ id: "guild1", name: "Test Guild" }];
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockData });
      (discordCache.get as jest.Mock).mockReturnValue(null);

      await cachedDiscordAxios.get("/users/@me/guilds", {
        headers: { Authorization: "Bearer token123" },
        userId: "user123",
      });

      expect(discordCache.set).toHaveBeenCalledWith(
        "guilds",
        "user123",
        mockData,
        expect.objectContaining({ encrypt: false })
      );
    });

    it("should not cache OAuth token requests", async () => {
      const mockData = { access_token: "token" };
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockData });
      (discordCache.get as jest.Mock).mockReturnValue(null);

      await cachedDiscordAxios.get("/oauth2/token", {
        headers: { Authorization: "Bearer token123" },
      });

      expect(discordCache.set).not.toHaveBeenCalled();
    });

    it("should respect cache disabled flag", async () => {
      const mockData = { id: "123" };
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockData });

      await cachedDiscordAxios.get("/users/@me", {
        headers: { Authorization: "Bearer token123" },
        userId: "user123",
        cache: { enabled: false },
      });

      expect(discordCache.get).not.toHaveBeenCalled();
      expect(discordCache.set).not.toHaveBeenCalled();
    });

    it("should use custom TTL when provided", async () => {
      const mockData = { id: "123" };
      const customTTL = 60000; // 1 minute
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockData });
      (discordCache.get as jest.Mock).mockReturnValue(null);

      await cachedDiscordAxios.get("/users/@me", {
        headers: { Authorization: "Bearer token123" },
        userId: "user123",
        cache: { ttl: customTTL },
      });

      expect(discordCache.set).toHaveBeenCalledWith(
        "user",
        expect.anything(),
        mockData,
        expect.objectContaining({ ttl: customTTL })
      );
    });

    it("should use custom namespace when provided", async () => {
      const mockData = { id: "123" };
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockData });
      (discordCache.get as jest.Mock).mockReturnValue(null);

      await cachedDiscordAxios.get("/users/@me", {
        headers: { Authorization: "Bearer token123" },
        userId: "user123",
        cache: { namespace: "custom" },
      });

      expect(discordCache.set).toHaveBeenCalledWith(
        "custom",
        expect.anything(),
        mockData,
        expect.anything()
      );
    });

    it("should handle API errors gracefully", async () => {
      const error = new Error("API Error");
      (DiscordAxios.get as jest.Mock).mockRejectedValue(error);
      (discordCache.get as jest.Mock).mockReturnValue(null);

      await expect(
        cachedDiscordAxios.get("/users/@me", {
          headers: { Authorization: "Bearer token123" },
          userId: "user123",
        })
      ).rejects.toThrow("API Error");

      expect(discordCache.set).not.toHaveBeenCalled();
    });
  });

  describe("Non-GET requests (no caching)", () => {
    it("should not cache POST requests", async () => {
      const mockData = { success: true };
      (DiscordAxios.post as jest.Mock).mockResolvedValue({ data: mockData });

      await cachedDiscordAxios.post("/api/endpoint", { data: "test" }, undefined);

      expect(DiscordAxios.post).toHaveBeenCalledWith("/api/endpoint", {
        data: "test",
      }, undefined);
      expect(discordCache.set).not.toHaveBeenCalled();
    });

    it("should not cache PUT requests", async () => {
      const mockData = { success: true };
      (DiscordAxios.put as jest.Mock).mockResolvedValue({ data: mockData });

      await cachedDiscordAxios.put("/api/endpoint", { data: "test" });

      expect(DiscordAxios.put).toHaveBeenCalled();
      expect(discordCache.set).not.toHaveBeenCalled();
    });

    it("should not cache DELETE requests", async () => {
      const mockData = { success: true };
      (DiscordAxios.delete as jest.Mock).mockResolvedValue({ data: mockData });

      await cachedDiscordAxios.delete("/api/endpoint");

      expect(DiscordAxios.delete).toHaveBeenCalled();
      expect(discordCache.set).not.toHaveBeenCalled();
    });

    it("should not cache PATCH requests", async () => {
      const mockData = { success: true };
      (DiscordAxios.patch as jest.Mock).mockResolvedValue({ data: mockData });

      await cachedDiscordAxios.patch("/api/endpoint", { data: "test" });

      expect(DiscordAxios.patch).toHaveBeenCalled();
      expect(discordCache.set).not.toHaveBeenCalled();
    });
  });

  describe("Cache invalidation", () => {
    it("should invalidate user cache", () => {
      cachedDiscordAxios.invalidateUserCache("user123");

      expect(discordCache.invalidateUser).toHaveBeenCalledWith("user123");
    });

    it("should clear all cache", () => {
      cachedDiscordAxios.clearCache();

      expect(discordCache.clear).toHaveBeenCalled();
    });
  });

  describe("User identification", () => {
    it("should use explicit userId for caching", async () => {
      const mockData = { id: "123" };
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockData });
      (discordCache.get as jest.Mock).mockReturnValue(null);

      await cachedDiscordAxios.get("/users/@me", {
        userId: "explicit-user-id",
        headers: { Authorization: "Bearer token123" },
      });

      expect(discordCache.get).toHaveBeenCalledWith("user", "explicit-user-id");
    });

    it("should not cache when userId is not provided (Authorization header alone is not enough)", async () => {
      const mockData = { id: "123" };
      const authHeader = "Bearer token123";
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockData });
      (discordCache.get as jest.Mock).mockReturnValue(null);

      await cachedDiscordAxios.get("/users/@me", {
        headers: { Authorization: authHeader },
      });

      // Should not cache without explicit userId
      expect(discordCache.set).not.toHaveBeenCalled();
    });

    it("should not cache when user identifier cannot be determined", async () => {
      const mockData = { id: "123" };
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockData });

      await cachedDiscordAxios.get("/users/@me", {});

      expect(discordCache.set).not.toHaveBeenCalled();
    });
  });

  describe("Cache key security", () => {
    it("should use different cache keys for different users", async () => {
      const mockData1 = { id: "user1" };
      const mockData2 = { id: "user2" };

      (DiscordAxios.get as jest.Mock).mockResolvedValueOnce({ data: mockData1 });
      (discordCache.get as jest.Mock).mockReturnValue(null);

      await cachedDiscordAxios.get("/users/@me", {
        userId: "user1",
        headers: { Authorization: "Bearer token1" },
      });

      (DiscordAxios.get as jest.Mock).mockResolvedValueOnce({ data: mockData2 });

      await cachedDiscordAxios.get("/users/@me", {
        userId: "user2",
        headers: { Authorization: "Bearer token2" },
      });

      // Verify different cache keys were used
      const calls = (discordCache.set as jest.Mock).mock.calls;
      expect(calls.length).toBe(2);
      expect(calls[0][1]).not.toBe(calls[1][1]); // Different identifiers
    });
  });
});
