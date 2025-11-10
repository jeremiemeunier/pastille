import request from "supertest";
import { createTestApp } from "../testApp";
import Command from "@models/Command.model";

jest.mock("@models/Command");

const app = createTestApp();

describe("Commands Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /commands", () => {
    it("should return all commands for a guild", async () => {
      const mockCommands = [
        {
          _id: "cmd1",
          guild_id: "guild123",
          terms: "!help",
          response: "Help message",
          role_id: "",
        },
        {
          _id: "cmd2",
          guild_id: "guild123",
          terms: "!info",
          response: "Info message",
          role_id: "role_id",
        },
      ];

      (Command.find as jest.Mock) = jest.fn().mockResolvedValue(mockCommands);

      const response = await request(app)
        .get("/commands")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockCommands });
    });

    it("should return 404 when no commands found", async () => {
      (Command.find as jest.Mock) = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get("/commands")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ guild_id: "guild123" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No commands");
    });
  });

  describe("GET /commands/id", () => {
    it("should return a command by id", async () => {
      const mockCommand = {
        _id: "507f1f77bcf86cd799439011",
        guild_id: "guild123",
        terms: "!help",
        response: "Help message",
      };

      (Command.findById as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockCommand);

      const response = await request(app)
        .get("/commands/id")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ id: "507f1f77bcf86cd799439011" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCommand);
    });

    it("should return 404 when command not found", async () => {
      (Command.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get("/commands/id")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ id: "507f1f77bcf86cd799439011" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No command with this _id");
    });

    it("should return 400 with invalid id", async () => {
      const response = await request(app)
        .get("/commands/id")
        .set("pastille_botid", process.env.BOT_ID!)
        .query({ id: "invalid-id" });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /commands/add", () => {
    it("should create a new command", async () => {
      const mockCommand = {
        guild_id: "guild123",
        terms: "!test",
        response: "Test response",
        role_id: "",
        save: jest.fn().mockResolvedValue(true),
      };

      (Command as any).mockImplementation(() => mockCommand);

      const response = await request(app)
        .post("/commands/add")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          guild_id: "guild123",
          terms: "!test",
          response: "Test response",
        });

      expect(response.status).toBe(201);
      expect(mockCommand.save).toHaveBeenCalled();
    });

    it("should return 400 with missing fields", async () => {
      const response = await request(app)
        .post("/commands/add")
        .set("pastille_botid", process.env.BOT_ID!)
        .send({
          guild_id: "guild123",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("You must provide all inputs");
    });
  });
});
