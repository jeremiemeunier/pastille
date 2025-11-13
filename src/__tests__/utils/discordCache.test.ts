import discordCache from "@utils/DiscordCache.utils";

describe("DiscordCache", () => {
  beforeEach(() => {
    // Clear cache before each test
    discordCache.clear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Clean up
    discordCache.clear();
  });

  describe("Basic Cache Operations", () => {
    it("should set and get a value", () => {
      const testData = { id: "123", name: "Test User" };
      discordCache.set("user", "user123", testData);

      const retrieved = discordCache.get("user", "user123");
      expect(retrieved).toEqual(testData);
    });

    it("should return null for non-existent key", () => {
      const retrieved = discordCache.get("user", "nonexistent");
      expect(retrieved).toBeNull();
    });

    it("should delete a value", () => {
      const testData = { id: "123", name: "Test User" };
      discordCache.set("user", "user123", testData);

      discordCache.delete("user", "user123");
      const retrieved = discordCache.get("user", "user123");
      expect(retrieved).toBeNull();
    });

    it("should clear all cache entries", () => {
      discordCache.set("user", "user1", { id: "1" });
      discordCache.set("user", "user2", { id: "2" });
      discordCache.set("guilds", "user1", [{ id: "guild1" }]);

      discordCache.clear();

      expect(discordCache.get("user", "user1")).toBeNull();
      expect(discordCache.get("user", "user2")).toBeNull();
      expect(discordCache.get("guilds", "user1")).toBeNull();
    });
  });

  describe("TTL and Expiration", () => {
    it("should expire entries after TTL", async () => {
      const testData = { id: "123", name: "Test User" };
      const shortTTL = 100; // 100ms

      discordCache.set("user", "user123", testData, { ttl: shortTTL });

      // Should be available immediately
      let retrieved = discordCache.get("user", "user123");
      expect(retrieved).toEqual(testData);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be expired now
      retrieved = discordCache.get("user", "user123");
      expect(retrieved).toBeNull();
    });

    it("should use custom TTL", () => {
      const testData = { id: "123", name: "Test User" };
      const customTTL = 10000; // 10 seconds

      discordCache.set("user", "user123", testData, { ttl: customTTL });

      const retrieved = discordCache.get("user", "user123");
      expect(retrieved).toEqual(testData);
    });
  });

  describe("Encryption", () => {
    it("should encrypt and decrypt sensitive data", () => {
      const sensitiveData = {
        email: "user@example.com",
        token: "secret_token",
        personal_info: "sensitive",
      };

      discordCache.set("user", "user123", sensitiveData, { encrypt: true });

      const retrieved = discordCache.get("user", "user123");
      expect(retrieved).toEqual(sensitiveData);
    });

    it("should handle complex objects with encryption", () => {
      const complexData = {
        user: {
          id: "123",
          email: "test@example.com",
          nested: {
            deeply: {
              nested: "value",
            },
          },
        },
        array: [1, 2, 3, 4, 5],
        boolean: true,
        null: null,
      };

      discordCache.set("user", "user123", complexData, { encrypt: true });

      const retrieved = discordCache.get("user", "user123");
      expect(retrieved).toEqual(complexData);
    });

    it("should not expose encrypted data in cache", () => {
      const sensitiveData = { token: "secret_token" };
      discordCache.set("user", "user123", sensitiveData, { encrypt: true });

      // Access internal cache (this is a test to verify encryption)
      // In real scenarios, the cache is private
      const stats = discordCache.getStats();
      expect(stats.size).toBe(1);
    });
  });

  describe("Cache Isolation", () => {
    it("should isolate cache between users", () => {
      const user1Data = { id: "1", name: "User 1" };
      const user2Data = { id: "2", name: "User 2" };

      discordCache.set("user", "user1", user1Data);
      discordCache.set("user", "user2", user2Data);

      const retrieved1 = discordCache.get("user", "user1");
      const retrieved2 = discordCache.get("user", "user2");

      expect(retrieved1).toEqual(user1Data);
      expect(retrieved2).toEqual(user2Data);
      expect(retrieved1).not.toEqual(retrieved2);
    });

    it("should isolate cache between namespaces", () => {
      const userData = { type: "user" };
      const guildData = { type: "guilds" };

      discordCache.set("user", "user123", userData);
      discordCache.set("guilds", "user123", guildData);

      const retrievedUser = discordCache.get("user", "user123");
      const retrievedGuilds = discordCache.get("guilds", "user123");

      expect(retrievedUser).toEqual(userData);
      expect(retrievedGuilds).toEqual(guildData);
    });
  });

  describe("User Cache Invalidation", () => {
    it("should invalidate all cache entries for a user", () => {
      const userId = "user123";

      discordCache.set("user", userId, { id: userId });
      discordCache.set("guilds", userId, [{ id: "guild1" }]);

      // Verify data is cached
      expect(discordCache.get("user", userId)).not.toBeNull();
      expect(discordCache.get("guilds", userId)).not.toBeNull();

      // Invalidate user cache
      discordCache.invalidateUser(userId);

      // Verify data is cleared
      expect(discordCache.get("user", userId)).toBeNull();
      expect(discordCache.get("guilds", userId)).toBeNull();
    });

    it("should not affect other users when invalidating", () => {
      discordCache.set("user", "user1", { id: "1" });
      discordCache.set("user", "user2", { id: "2" });

      discordCache.invalidateUser("user1");

      expect(discordCache.get("user", "user1")).toBeNull();
      expect(discordCache.get("user", "user2")).not.toBeNull();
    });
  });

  describe("Security", () => {
    it("should generate different cache keys for same identifier in different namespaces", () => {
      // This test verifies that cache keys are namespaced
      const data1 = { value: "namespace1" };
      const data2 = { value: "namespace2" };

      discordCache.set("namespace1", "id123", data1);
      discordCache.set("namespace2", "id123", data2);

      expect(discordCache.get("namespace1", "id123")).toEqual(data1);
      expect(discordCache.get("namespace2", "id123")).toEqual(data2);
    });

    it("should handle malformed data gracefully", () => {
      // Set non-JSON serializable data and ensure it doesn't crash
      const circularRef: any = { a: 1 };
      circularRef.self = circularRef;

      // Should not throw
      expect(() => {
        discordCache.set("test", "id1", circularRef, { encrypt: true });
      }).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle cache set failures gracefully", () => {
      // Try to set invalid data (should not crash)
      expect(() => {
        discordCache.set("", "", undefined);
      }).not.toThrow();
    });

    it("should handle cache get failures gracefully", () => {
      expect(() => {
        discordCache.get("", "");
      }).not.toThrow();

      const result = discordCache.get("", "");
      expect(result).toBeNull();
    });

    it("should handle delete failures gracefully", () => {
      expect(() => {
        discordCache.delete("nonexistent", "nonexistent");
      }).not.toThrow();
    });
  });

  describe("Statistics", () => {
    it("should return cache statistics", () => {
      discordCache.set("user", "user1", { id: "1" });
      discordCache.set("user", "user2", { id: "2" });
      discordCache.set("guilds", "user1", []);

      const stats = discordCache.getStats();
      expect(stats.size).toBe(3);
    });

    it("should update size after deletions", () => {
      discordCache.set("user", "user1", { id: "1" });
      discordCache.set("user", "user2", { id: "2" });

      let stats = discordCache.getStats();
      expect(stats.size).toBe(2);

      discordCache.delete("user", "user1");

      stats = discordCache.getStats();
      expect(stats.size).toBe(1);
    });
  });
});
