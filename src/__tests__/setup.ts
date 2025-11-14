// Mock environment variables for testing
process.env.BOT_ID = "test-bot-id";
process.env.BOT_TOKEN = "test-bot-token";
process.env.MONGO_URI = "mongodb://localhost:27017/pastille-test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-purposes-at-least-64-characters-long";
process.env.BOT_SECRET_SIG = "test-secret-sig";
process.env.DISCORD_PUBLIC_KEY = "test-public-key";
process.env.TWITCH_SECRET = "test-twitch-secret";
process.env.TWITCH_CLIENT = "test-twitch-client";

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
