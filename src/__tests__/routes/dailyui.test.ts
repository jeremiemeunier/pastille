import request from "supertest";
import { createTestApp } from "../testApp";
import Dailyui from "@models/Dailyui.model";

jest.mock("@models/Dailyui.model");

const app = createTestApp();

describe("DailyUI Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PUT /dailyui", () => {
    it("should update a dailyui state", async () => {
      const mockDailyui = { _id: "507f1f77bcf86cd799439011", available: false };
      (Dailyui.findOneAndUpdate as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockDailyui);

      const response = await request(app)
        .put("/dailyui")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ id: "507f1f77bcf86cd799439011" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockDailyui);
    });

    it("should return 400 with invalid id", async () => {
      const response = await request(app)
        .put("/dailyui")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ id: "invalid-id" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid Id provided");
    });

    it("should return 403 without authorization", async () => {
      const response = await request(app)
        .put("/dailyui")
        .query({ id: "507f1f77bcf86cd799439011" });

      expect(response.status).toBe(403);
    });
  });

  describe("GET /dailyui", () => {
    it("should return available dailyui", async () => {
      const mockDailyui = {
        _id: "dailyui123",
        guild_id: "guild123",
        available: true,
        title: "Test Challenge",
        description: "Test Description",
      };

      (Dailyui.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockDailyui);

      const response = await request(app)
        .get("/dailyui")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDailyui);
    });

    it("should return 404 when no dailyui available", async () => {
      (Dailyui.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get("/dailyui")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No dailyui available");
    });

    it("should return 400 without guild_id", async () => {
      const response = await request(app)
        .get("/dailyui")
        .set("pastille_botid", process.env.BOT_ID!);

      expect(response.status).toBe(400);
    });
  });

  describe("POST /dailyui", () => {
    it("should create a new dailyui", async () => {
      const mockDailyui = {
        guild_id: "guild123",
        available: true,
        title: "Test Challenge",
        description: "Test Description",
        save: jest.fn().mockResolvedValue(true),
      };

      (Dailyui as any).mockImplementation(() => mockDailyui);

      const response = await request(app)
        .post("/dailyui")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          guild_id: "guild123",
          state: true,
          title: "Test Challenge",
          description: "Test Description",
        });

      expect(response.status).toBe(200);
      expect(mockDailyui.save).toHaveBeenCalled();
    });

    it("should return 400 with missing fields", async () => {
      const response = await request(app)
        .post("/dailyui")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          guild_id: "guild123",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Complete all input");
    });
  });

  describe("POST /dailyui/mass", () => {
    it("should create multiple dailyui challenges", async () => {
      const mockDailyui = {
        save: jest.fn().mockResolvedValue(true),
      };

      (Dailyui as any).mockImplementation(() => mockDailyui);

      const response = await request(app)
        .post("/dailyui/mass")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          data: [
            {
              guild_id: "guild123",
              title: "Challenge 1",
              description: "Description 1",
            },
            {
              guild_id: "guild123",
              title: "Challenge 2",
              description: "Description 2",
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("New daily challenge added");
    });
  });
});
