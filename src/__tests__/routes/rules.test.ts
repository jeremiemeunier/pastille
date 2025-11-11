import request from "supertest";
import { createTestApp } from "../testApp";
import Rule from "@models/Rule.model";

jest.mock("@models/Rule");

const app = createTestApp();

describe("Rules Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /rules", () => {
    it("should return all rules for a guild", async () => {
      const mockRules = [
        {
          _id: "rule1",
          guild_id: "guild123",
          name: "Rule 1",
          description: "Desc 1",
          active: true,
        },
        {
          _id: "rule2",
          guild_id: "guild123",
          name: "Rule 2",
          description: "Desc 2",
          active: true,
        },
      ];

      (Rule.find as jest.Mock) = jest.fn().mockResolvedValue(mockRules);

      const response = await request(app)
        .get("/rules")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRules);
    });

    it("should return 404 when no rules found", async () => {
      (Rule.find as jest.Mock) = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get("/rules")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No rules found");
    });

    it("should return 403 without authorization", async () => {
      const response = await request(app)
        .get("/rules")
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(403);
    });
  });

  describe("POST /rules/add", () => {
    it("should create a new rule", async () => {
      const mockRule = {
        guild_id: "guild123",
        name: "New Rule",
        description: "New Description",
        active: true,
        save: jest.fn().mockResolvedValue(true),
      };

      (Rule as any).mockImplementation(() => mockRule);

      const response = await request(app)
        .post("/rules/add")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          guild_id: "guild123",
          name: "New Rule",
          description: "New Description",
          active: true,
        });

      expect(response.status).toBe(201);
      expect(mockRule.save).toHaveBeenCalled();
    });

    it("should return 400 with missing fields", async () => {
      const response = await request(app)
        .post("/rules/add")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          guild_id: "guild123",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("You must provide all input");
    });
  });

  describe("PUT /rules/update", () => {
    it("should update a rule", async () => {
      const mockRule = {
        _id: "507f1f77bcf86cd799439011",
        guild_id: "guild123",
        name: "Updated Rule",
        description: "Updated Description",
        active: true,
      };

      (Rule.findByIdAndUpdate as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockRule);

      const response = await request(app)
        .put("/rules/update")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          id: "507f1f77bcf86cd799439011",
          guild_id: "guild123",
          name: "Updated Rule",
          description: "Updated Description",
          active: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockRule);
    });

    it("should return 400 with invalid id", async () => {
      const response = await request(app)
        .put("/rules/update")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          id: "invalid-id",
          guild_id: "guild123",
          name: "Updated Rule",
          description: "Updated Description",
          active: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid Id provided");
    });

    it("should return 400 with missing fields", async () => {
      const response = await request(app)
        .put("/rules/update")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          id: "507f1f77bcf86cd799439011",
          guild_id: "guild123",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("You must provide all input");
    });
  });
});
