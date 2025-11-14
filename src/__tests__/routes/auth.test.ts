import request from "supertest";
import { createTestApp } from "../testApp";
import User from "@models/User.model";
import Guild from "@models/Guild.model";
import Session from "@models/Session.model";
import * as TokenManager from "@utils/TokenManager.utils";
import DiscordAxios from "@utils/DiscordAxios.utils";

// Mock the models
jest.mock("@models/User.model");
jest.mock("@models/Guild.model");
jest.mock("@models/Session.model");
jest.mock("@utils/DiscordAxios");

const app = createTestApp();

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /auth/me", () => {
    it("should return user data with valid token", async () => {
      const mockUser = {
        _id: "user123",
        discord_id: "discord123",
        personal: {
          username: "testuser",
          global_name: "Test User",
          email: "test@example.com",
          avatar: "avatar_hash",
          verified: true,
        },
        credentials: {
          token: "discord_token",
          refresh_token: "discord_refresh",
          expires_in: 604800,
          token_type: "Bearer",
        },
        private: {
          last_login: new Date().toISOString(),
          signup_date: new Date().toISOString(),
        },
      };

      const mockSession = {
        user_id: "user123",
        token: "valid_jwt_token",
        expires_at: new Date(Date.now() + 86400000),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);

      // Mock token verification
      jest.spyOn(TokenManager, "verifyToken").mockReturnValue({
        user_id: "user123",
        discord_id: "discord123",
      });
      jest.spyOn(TokenManager, "validateSession").mockResolvedValue(true);

      const response = await request(app)
        .get("/auth/me")
        .set("Authorization", "Bearer valid_jwt_token");

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.discord_id).toBe("discord123");
      // Should not contain sensitive data
      expect(response.body.user.credentials).toBeUndefined();
      expect(response.body.user.personal.email).toBe("");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authentication required");
    });

    it("should return 401 with invalid token", async () => {
      jest.spyOn(TokenManager, "verifyToken").mockReturnValue(null);

      const response = await request(app)
        .get("/auth/me")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid or expired token");
    });
  });

  describe("POST /auth/logout", () => {
    it("should logout successfully with valid token", async () => {
      const mockSession = {
        user_id: "user123",
        token: "valid_jwt_token",
        expires_at: new Date(Date.now() + 86400000),
      };

      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);
      (Session.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      jest.spyOn(TokenManager, "verifyToken").mockReturnValue({
        user_id: "user123",
        discord_id: "discord123",
      });
      jest.spyOn(TokenManager, "validateSession").mockResolvedValue(true);
      jest.spyOn(TokenManager, "revokeSession").mockResolvedValue();

      const response = await request(app)
        .post("/auth/logout")
        .set("Authorization", "Bearer valid_jwt_token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logged out successfully");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).post("/auth/logout");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authentication required");
    });
  });

  describe("POST /auth/logout/all", () => {
    it("should logout from all devices successfully", async () => {
      const mockSession = {
        user_id: "user123",
        token: "valid_jwt_token",
        expires_at: new Date(Date.now() + 86400000),
      };

      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);
      (Session.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 3 });

      jest.spyOn(TokenManager, "verifyToken").mockReturnValue({
        user_id: "user123",
        discord_id: "discord123",
      });
      jest.spyOn(TokenManager, "validateSession").mockResolvedValue(true);
      jest.spyOn(TokenManager, "revokeAllUserSessions").mockResolvedValue();

      const response = await request(app)
        .post("/auth/logout/all")
        .set("Authorization", "Bearer valid_jwt_token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logged out from all devices");
    });
  });

  describe("GET /auth/guilds", () => {
    it("should return guilds where user can add bots with botAdded indicator", async () => {
      const mockUser = {
        _id: "user123",
        discord_id: "discord123",
        personal: {
          username: "testuser",
          global_name: "Test User",
          email: "test@example.com",
          avatar: "avatar_hash",
          verified: true,
        },
        credentials: {
          token: "discord_access_token",
          refresh_token: "discord_refresh",
          expires_in: 604800,
          token_type: "Bearer",
        },
        private: {
          last_login: new Date().toISOString(),
          signup_date: new Date().toISOString(),
        },
      };

      const mockSession = {
        user_id: "user123",
        token: "valid_jwt_token",
        expires_at: new Date(Date.now() + 86400000),
      };

      const mockGuilds = [
        {
          id: "guild1",
          name: "Guild 1",
          icon: "icon1",
          owner: false,
          permissions: "2147483647", // All permissions including MANAGE_GUILD
        },
        {
          id: "guild2",
          name: "Guild 2",
          icon: "icon2",
          owner: false,
          permissions: "0", // No permissions
        },
        {
          id: "guild3",
          name: "Guild 3",
          icon: "icon3",
          owner: true,
          permissions: "2147483647", // Owner has all permissions
        },
      ];

      // Mock that bot is only in guild1
      const mockBotGuilds = [
        { id: "guild1" },
      ];

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);
      (DiscordAxios.get as jest.Mock).mockResolvedValue({ data: mockGuilds });
      (Guild.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockBotGuilds),
      });

      jest.spyOn(TokenManager, "verifyToken").mockReturnValue({
        user_id: "user123",
        discord_id: "discord123",
      });
      jest.spyOn(TokenManager, "validateSession").mockResolvedValue(true);

      const response = await request(app)
        .get("/auth/guilds")
        .set("Authorization", "Bearer valid_jwt_token");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Should only return guilds where user has MANAGE_GUILD permission
      expect(response.body.length).toBe(2);
      expect(response.body[0].id).toBe("guild1");
      expect(response.body[0].botAdded).toBe(true);
      expect(response.body[1].id).toBe("guild3");
      expect(response.body[1].botAdded).toBe(false);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/auth/guilds");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authentication required");
    });

    it("should return 404 if user not found", async () => {
      const mockSession = {
        user_id: "user123",
        token: "valid_jwt_token",
        expires_at: new Date(Date.now() + 86400000),
      };

      (User.findById as jest.Mock).mockResolvedValue(null);
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);

      jest.spyOn(TokenManager, "verifyToken").mockReturnValue({
        user_id: "user123",
        discord_id: "discord123",
      });
      jest.spyOn(TokenManager, "validateSession").mockResolvedValue(true);

      const response = await request(app)
        .get("/auth/guilds")
        .set("Authorization", "Bearer valid_jwt_token");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should return 500 if Discord API fails", async () => {
      const mockUser = {
        _id: "user123",
        discord_id: "discord123",
        personal: {
          username: "testuser",
          global_name: "Test User",
          email: "test@example.com",
          avatar: "avatar_hash",
          verified: true,
        },
        credentials: {
          token: "discord_access_token",
          refresh_token: "discord_refresh",
          expires_in: 604800,
          token_type: "Bearer",
        },
        private: {
          last_login: new Date().toISOString(),
          signup_date: new Date().toISOString(),
        },
      };

      const mockSession = {
        user_id: "user123",
        token: "valid_jwt_token",
        expires_at: new Date(Date.now() + 86400000),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);
      (DiscordAxios.get as jest.Mock).mockRejectedValue(
        new Error("Discord API error")
      );

      jest.spyOn(TokenManager, "verifyToken").mockReturnValue({
        user_id: "user123",
        discord_id: "discord123",
      });
      jest.spyOn(TokenManager, "validateSession").mockResolvedValue(true);

      const response = await request(app)
        .get("/auth/guilds")
        .set("Authorization", "Bearer valid_jwt_token");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });

    it("should return 401 if Discord token is expired or invalid", async () => {
      const mockUser = {
        _id: "user123",
        discord_id: "discord123",
        personal: {
          username: "testuser",
          global_name: "Test User",
          email: "test@example.com",
          avatar: "avatar_hash",
          verified: true,
        },
        credentials: {
          token: "expired_discord_token",
          refresh_token: "discord_refresh",
          expires_in: 604800,
          token_type: "Bearer",
        },
        private: {
          last_login: new Date().toISOString(),
          signup_date: new Date().toISOString(),
        },
      };

      const mockSession = {
        user_id: "user123",
        token: "valid_jwt_token",
        expires_at: new Date(Date.now() + 86400000),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);
      (DiscordAxios.get as jest.Mock).mockRejectedValue({
        code: 0,
        message: "401: Unauthorized",
      });

      jest.spyOn(TokenManager, "verifyToken").mockReturnValue({
        user_id: "user123",
        discord_id: "discord123",
      });
      jest.spyOn(TokenManager, "validateSession").mockResolvedValue(true);

      const response = await request(app)
        .get("/auth/guilds")
        .set("Authorization", "Bearer valid_jwt_token");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Discord token expired or invalid");
      expect(response.body.error).toBe("unauthorized");
    });
  });
});
