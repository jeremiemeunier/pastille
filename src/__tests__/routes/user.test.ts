import request from "supertest";
import { createTestApp } from "../testApp";
import User from "@models/User.model";
import Session from "@models/Session.model";
import * as TokenManager from "@utils/TokenManager.utils";

// Mock the models
jest.mock("@models/User.model");
jest.mock("@models/Session.model");

const app = createTestApp();

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /user/:discord_id", () => {
    it("should return public user data", async () => {
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
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get("/user/discord123");

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.discord_id).toBe("discord123");
      // Should not contain sensitive data
      expect(response.body.user.personal.email).toBe("");
      expect(response.body.user.credentials).toBeUndefined();
    });

    it("should return 404 if user not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/user/nonexistent");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("PUT /user/profile", () => {
    it("should update user profile with valid authentication", async () => {
      const mockUser = {
        _id: "user123",
        discord_id: "discord123",
        personal: {
          username: "testuser",
          global_name: "Test User",
          avatar: "old_avatar",
        },
      };

      const updatedUser = {
        ...mockUser,
        personal: {
          ...mockUser.personal,
          avatar: "new_avatar",
        },
      };

      const mockSession = {
        user_id: "user123",
        token: "valid_jwt_token",
        expires_at: new Date(Date.now() + 86400000),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);

      jest.spyOn(TokenManager, "verifyToken").mockReturnValue({
        user_id: "user123",
        discord_id: "discord123",
      });
      jest.spyOn(TokenManager, "validateSession").mockResolvedValue(true);

      const response = await request(app)
        .put("/user/profile")
        .set("Authorization", "Bearer valid_jwt_token")
        .send({ avatar: "new_avatar" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Profile updated successfully");
    });

    it("should return 403 without authentication (CSRF protection)", async () => {
      const response = await request(app)
        .put("/user/profile")
        .send({ avatar: "new_avatar" });

      expect(response.status).toBe(403);
    });

    it("should return 400 if no valid fields to update", async () => {
      const mockUser = {
        _id: "user123",
        discord_id: "discord123",
      };

      const mockSession = {
        user_id: "user123",
        token: "valid_jwt_token",
        expires_at: new Date(Date.now() + 86400000),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);

      jest.spyOn(TokenManager, "verifyToken").mockReturnValue({
        user_id: "user123",
        discord_id: "discord123",
      });
      jest.spyOn(TokenManager, "validateSession").mockResolvedValue(true);

      const response = await request(app)
        .put("/user/profile")
        .set("Authorization", "Bearer valid_jwt_token")
        .send({ invalid_field: "value" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("No valid fields to update");
    });
  });

  describe("DELETE /user/account", () => {
    it("should delete user account with valid authentication", async () => {
      const mockUser = {
        _id: "user123",
        discord_id: "discord123",
      };

      const mockSession = {
        user_id: "user123",
        token: "valid_jwt_token",
        expires_at: new Date(Date.now() + 86400000),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);

      jest.spyOn(TokenManager, "verifyToken").mockReturnValue({
        user_id: "user123",
        discord_id: "discord123",
      });
      jest.spyOn(TokenManager, "validateSession").mockResolvedValue(true);

      const response = await request(app)
        .delete("/user/account")
        .set("Authorization", "Bearer valid_jwt_token");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Account deleted successfully");
    });

    it("should return 403 without authentication (CSRF protection)", async () => {
      const response = await request(app).delete("/user/account");

      expect(response.status).toBe(403);
    });
  });
});
