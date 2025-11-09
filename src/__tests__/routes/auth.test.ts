import request from "supertest";
import { createTestApp } from "../testApp";
import User from "@models/User";
import Session from "@models/Session";
import * as TokenManager from "@utils/TokenManager";

// Mock the models
jest.mock("@models/User");
jest.mock("@models/Session");
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
});
