import request from "supertest";
import { createTestApp } from "../testApp";
import Sanction from "@models/Sanction.model";

jest.mock("@models/Sanction");

const app = createTestApp();

describe("Sanction Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PUT /sanction/update", () => {
    it("should update a sanction", async () => {
      const mockSanction = { _id: "sanction123", checkable: false };
      (Sanction.findByIdAndUpdate as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockSanction);

      const response = await request(app)
        .put("/sanction/update")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ id: "sanction123" });

      expect(response.status).toBe(204);
    });

    it("should return 403 without authorization", async () => {
      const response = await request(app)
        .put("/sanction/update")
        .query({ id: "sanction123" });

      expect(response.status).toBe(403);
    });
  });

  describe("POST /sanction/add", () => {
    it("should create a new sanction", async () => {
      const mockSanction = {
        user_id: "user123",
        guild_id: "guild123",
        sanction: {
          level: 1,
          date: new Date(),
          ending: new Date(),
        },
        checkable: true,
        save: jest.fn().mockResolvedValue(true),
      };

      (Sanction as any).mockImplementation(() => mockSanction);

      const response = await request(app)
        .post("/sanction/add")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          user_id: "user123",
          guild_id: "guild123",
          level: 1,
          date: new Date(),
          end: new Date(),
        });

      expect(response.status).toBe(204);
      expect(mockSanction.save).toHaveBeenCalled();
    });

    it("should return 403 without authorization", async () => {
      const response = await request(app).post("/sanction/add").send({
        user_id: "user123",
        guild_id: "guild123",
        level: 1,
        date: new Date(),
        end: new Date(),
      });

      expect(response.status).toBe(403);
    });
  });

  describe("GET /sanction", () => {
    it("should return all sanctions for a guild", async () => {
      const mockSanctions = [
        { _id: "sanction1", guild_id: "guild123", checkable: true },
        { _id: "sanction2", guild_id: "guild123", checkable: true },
      ];

      (Sanction.find as jest.Mock) = jest.fn().mockResolvedValue(mockSanctions);

      const response = await request(app)
        .get("/sanction")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSanctions);
    });

    it("should return 403 without authorization", async () => {
      const response = await request(app)
        .get("/sanction")
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(403);
    });
  });
});
