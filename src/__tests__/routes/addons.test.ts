import request from "supertest";
import { createTestApp } from "../testApp";
import Addons from "@models/Addons.model";

jest.mock("@models/Addons.model");

const app = createTestApp();

describe("Addons Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /addons", () => {
    it("should return all addons for a guild", async () => {
      const mockAddons = [
        {
          _id: "addon1",
          guild_id: "guild123",
          name: "Twitch",
          active: true,
          channel: "channel_id",
          role: "role_id",
        },
        {
          _id: "addon2",
          guild_id: "guild123",
          name: "DailyUI",
          active: true,
          channel: "channel_id2",
          role: "role_id2",
        },
      ];

      (Addons.find as jest.Mock) = jest.fn().mockResolvedValue(mockAddons);

      const response = await request(app)
        .get("/addons")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAddons);
    });

    it("should return 404 when no addons found", async () => {
      (Addons.find as jest.Mock) = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get("/addons")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No addons");
    });
  });

  describe("POST /addons/add", () => {
    it("should create a new addon", async () => {
      const mockAddon = {
        guild_id: "guild123",
        name: "Twitch",
        active: true,
        channel: "channel_id",
        role: "role_id",
        save: jest.fn().mockResolvedValue(true),
      };

      (Addons as any).mockImplementation(() => mockAddon);

      const response = await request(app)
        .post("/addons/add")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          guild_id: "guild123",
          name: "Twitch",
          active: true,
          channel: "channel_id",
          role: "role_id",
        });

      expect(response.status).toBe(201);
      expect(mockAddon.save).toHaveBeenCalled();
    });
  });

  describe("PUT /addons/update", () => {
    it("should update an addon", async () => {
      const mockAddon = {
        _id: "507f1f77bcf86cd799439011",
        guild_id: "guild123",
        name: "Twitch",
        active: true,
        channel: "channel_id",
        role: "role_id",
      };

      (Addons.findOneAndUpdate as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockAddon);

      const response = await request(app)
        .put("/addons/update")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          id: "507f1f77bcf86cd799439011",
          guild_id: "guild123",
          name: "Twitch",
          active: true,
          channel: "channel_id",
          role: "role_id",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockAddon);
    });

    it("should return 400 with invalid id", async () => {
      const response = await request(app)
        .put("/addons/update")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          id: "invalid-id",
          guild_id: "guild123",
          name: "Twitch",
          active: false,
          channel: "channel_id",
          role: "role_id",
        });

      expect(response.status).toBe(400);
    });
  });
});
