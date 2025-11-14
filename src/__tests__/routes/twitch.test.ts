import request from "supertest";
import { createTestApp } from "../testApp";
import Streamers from "@models/Streamer.model";

jest.mock("@models/Streamer.model");

const app = createTestApp();

describe("Twitch Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /twitch/streamers", () => {
    it("should return unvalidated streamers", async () => {
      const mockStreamers = [
        {
          _id: "streamer1",
          id: "twitch_id1",
          name: "Streamer1",
          isValid: false,
        },
        {
          _id: "streamer2",
          id: "twitch_id2",
          name: "Streamer2",
          isValid: false,
        },
      ];

      (Streamers.find as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockStreamers);

      const response = await request(app)
        .get("/twitch/streamers")
        .set("pastille_botid", process.env.BOT_ID!);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStreamers);
    });

    it("should return 404 when no streamers found", async () => {
      (Streamers.find as jest.Mock) = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get("/twitch/streamers")
        .set("pastille_botid", process.env.BOT_ID!);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No streamer found");
    });
  });

  describe("GET /twitch/live", () => {
    it("should return live streamers to announce", async () => {
      const mockLiveStreamers = [
        {
          _id: "streamer1",
          isLive: true,
          isAnnounce: false,
          name: "Streamer1",
        },
      ];

      (Streamers.find as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockLiveStreamers);

      const response = await request(app)
        .get("/twitch/live")
        .set("pastille_botid", process.env.BOT_ID!);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLiveStreamers);
    });

    it("should return 404 when no live streamers to announce", async () => {
      (Streamers.find as jest.Mock) = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get("/twitch/live")
        .set("pastille_botid", process.env.BOT_ID!);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No live to be announced");
    });
  });

  describe("PATCH /twitch/streamers/:id", () => {
    it("should update streamer validation status", async () => {
      (Streamers.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        isValid: true,
      });

      const response = await request(app)
        .patch("/twitch/streamers/507f1f77bcf86cd799439011")
        .set("pastille_botid", process.env.BOT_ID!);

      expect(response.status).toBe(204);
    });
  });

  describe("POST /twitch/streamers", () => {
    it("should add new streamer", async () => {
      const mockStreamer = {
        id: "twitch_id1",
        name: "Streamer1",
        isLive: false,
        isAnnounce: false,
        isValid: false,
        announcer: [
          {
            guild_id: "guild123",
            channel_id: "channel123",
            role_id: "role123",
            message: "Live now!",
            progress: false,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      (Streamers.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Streamers as any).mockImplementation(() => mockStreamer);

      const response = await request(app)
        .post("/twitch/streamers")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          streamer_id: "twitch_id1",
          streamer_name: "Streamer1",
          guild_id: "guild123",
          channel_id: "channel123",
          role_id: "role123",
          message: "Live now!",
          progress: false,
        });

      expect(response.status).toBe(201);
      expect(mockStreamer.save).toHaveBeenCalled();
    });

    it("should add announcer to existing streamer", async () => {
      const mockExistingStreamer = {
        id: "twitch_id1",
        name: "Streamer1",
        announcer: [
          {
            guild_id: "guild456",
            channel_id: "channel456",
            role_id: "role456",
            message: "",
            progress: false,
          },
        ],
      };

      (Streamers.findOne as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockExistingStreamer);
      (Streamers.findOneAndUpdate as jest.Mock) = jest.fn().mockResolvedValue({
        ...mockExistingStreamer,
        announcer: [
          ...mockExistingStreamer.announcer,
          {
            guild_id: "guild123",
            channel_id: "channel123",
            role_id: "role123",
            message: "Live now!",
            progress: false,
          },
        ],
      });

      const response = await request(app)
        .post("/twitch/streamers")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          streamer_id: "twitch_id1",
          streamer_name: "Streamer1",
          guild_id: "guild123",
          channel_id: "channel123",
          role_id: "role123",
          message: "Live now!",
          progress: false,
        });

      expect(response.status).toBe(201);
    });
  });

  describe("DELETE /twitch/streamers", () => {
    it("should remove announcer from streamer with multiple announcers", async () => {
      const mockStreamer = {
        id: "twitch_id1",
        announcer: [
          {
            guild_id: "guild123",
            channel_id: "channel123",
            role_id: "role123",
            message: "",
            progress: false,
          },
          {
            guild_id: "guild456",
            channel_id: "channel456",
            role_id: "role456",
            message: "",
            progress: false,
          },
        ],
      };

      (Streamers.findOne as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockStreamer);
      (Streamers.findOneAndUpdate as jest.Mock) = jest.fn().mockResolvedValue({
        id: "twitch_id1",
        announcer: [
          {
            guild_id: "guild456",
            channel_id: "channel456",
            role_id: "role456",
            message: "",
            progress: false,
          },
        ],
      });

      const response = await request(app)
        .delete("/twitch/streamers")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          streamer_id: "twitch_id1",
          guild_id: "guild123",
        });

      expect(response.status).toBe(201);
    });

    it("should delete streamer with single announcer", async () => {
      const mockStreamer = {
        id: "twitch_id1",
        announcer: [
          {
            guild_id: "guild123",
            channel_id: "channel123",
            role_id: "role123",
            message: "",
            progress: false,
          },
        ],
      };

      (Streamers.findOne as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockStreamer);
      (Streamers.deleteOne as jest.Mock) = jest
        .fn()
        .mockResolvedValue({ deletedCount: 1 });

      const response = await request(app)
        .delete("/twitch/streamers")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          streamer_id: "twitch_id1",
          guild_id: "guild123",
        });

      expect(response.status).toBe(204);
    });
  });
});
