import {
  buildConversationContext,
  removeMentions,
} from "@functions/messageContext";
import { Message } from "discord.js";

describe("removeMentions", () => {
  it("should remove mentions from content", () => {
    expect(removeMentions("Hello <@123456789>!")).toBe("Hello !");
    expect(removeMentions("Hi <@!987654321> how are you?")).toBe(
      "Hi  how are you?"
    );
    expect(removeMentions("<@123> <@!456> test")).toBe("test");
  });

  it("should handle content with no mentions", () => {
    expect(removeMentions("Hello world!")).toBe("Hello world!");
  });

  it("should trim whitespace", () => {
    expect(removeMentions("  <@123456789>  ")).toBe("");
    expect(removeMentions("  Hello  ")).toBe("Hello");
  });
});

describe("buildConversationContext", () => {
  const mockBotId = "123456789";

  it("should return empty array when message has no reference", async () => {
    const mockMessage = {
      id: "msg1",
      content: "Hello bot!",
      reference: null,
      author: {
        id: "user1",
      },
      channel: {
        messages: {
          fetch: jest.fn(),
        },
      },
    } as unknown as Message;

    const result = await buildConversationContext(mockMessage, mockBotId);

    expect(result).toEqual([]);
    expect(mockMessage.channel.messages.fetch).not.toHaveBeenCalled();
  });

  it("should build conversation context from reply chain", async () => {
    const mockReferencedMessage = {
      id: "msg0",
      content: "Hi there! <@123456789>",
      author: {
        id: mockBotId,
      },
      reference: null,
    } as unknown as Message;

    const mockMessage = {
      id: "msg1",
      content: "How are you? <@123456789>",
      reference: {
        messageId: "msg0",
      },
      author: {
        id: "user1",
      },
      channel: {
        messages: {
          fetch: jest.fn().mockResolvedValue(mockReferencedMessage),
        },
      },
    } as unknown as Message;

    const result = await buildConversationContext(mockMessage, mockBotId);

    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("assistant");
    expect(result[0].content).toBe("Hi there!");
    expect(mockMessage.channel.messages.fetch).toHaveBeenCalledWith("msg0");
  });

  it("should handle multiple messages in reply chain", async () => {
    const mockMessage3 = {
      id: "msg3",
      content: "That's great!",
      author: {
        id: mockBotId,
      },
      reference: null,
    } as unknown as Message;

    const mockMessage2 = {
      id: "msg2",
      content: "I'm doing well! @bot",
      author: {
        id: "user1",
      },
      reference: {
        messageId: "msg3",
      },
      channel: {
        messages: {
          fetch: jest.fn().mockResolvedValue(mockMessage3),
        },
      },
    } as unknown as Message;

    const mockMessage1 = {
      id: "msg1",
      content: "Tell me more @bot",
      author: {
        id: "user1",
      },
      reference: {
        messageId: "msg2",
      },
      channel: {
        messages: {
          fetch: jest
            .fn()
            .mockResolvedValueOnce(mockMessage2)
            .mockResolvedValueOnce(mockMessage3),
        },
      },
    } as unknown as Message;

    const result = await buildConversationContext(mockMessage1, mockBotId);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].role).toBe("assistant");
    expect(result[0].content).toBe("That's great!");
  });

  it("should remove mentions from content", async () => {
    const mockReferencedMessage = {
      id: "msg0",
      content: "Hello <@123456789> how can I help?",
      author: {
        id: mockBotId,
      },
      reference: null,
    } as unknown as Message;

    const mockMessage = {
      id: "msg1",
      content: "I need help <@123456789>",
      reference: {
        messageId: "msg0",
      },
      author: {
        id: "user1",
      },
      channel: {
        messages: {
          fetch: jest.fn().mockResolvedValue(mockReferencedMessage),
        },
      },
    } as unknown as Message;

    const result = await buildConversationContext(mockMessage, mockBotId);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("Hello  how can I help?");
  });

  it("should handle fetch errors gracefully", async () => {
    const mockMessage = {
      id: "msg1",
      content: "Hello bot!",
      reference: {
        messageId: "msg0",
      },
      author: {
        id: "user1",
      },
      channel: {
        messages: {
          fetch: jest.fn().mockRejectedValue(new Error("Message not found")),
        },
      },
    } as unknown as Message;

    const result = await buildConversationContext(mockMessage, mockBotId);

    expect(result).toEqual([]);
  });

  it("should limit conversation history to 10 messages", async () => {
    let messageCount = 0;
    const createMockMessage = (id: string, refId: string | null): Message => {
      messageCount++;
      return {
        id,
        content: `Message ${id}`,
        author: {
          id: messageCount % 2 === 0 ? mockBotId : "user1",
        },
        reference: refId ? { messageId: refId } : null,
      } as unknown as Message;
    };

    // Create a chain of 15 messages
    const messages: Message[] = [];
    for (let i = 0; i < 15; i++) {
      const refId = i > 0 ? `msg${i - 1}` : null;
      messages.push(createMockMessage(`msg${i}`, refId));
    }

    const mockMessage = {
      id: "msg15",
      content: "Current message",
      reference: {
        messageId: "msg14",
      },
      author: {
        id: "user1",
      },
      channel: {
        messages: {
          fetch: jest.fn().mockImplementation((id: string) => {
            const msg = messages.find((m) => m.id === id);
            return Promise.resolve(msg);
          }),
        },
      },
    } as unknown as Message;

    const result = await buildConversationContext(mockMessage, mockBotId);

    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("should prevent infinite loops with circular references", async () => {
    const mockChannelMessages = {
      fetch: jest.fn().mockImplementation((id: string) => {
        if (id === "msg1") {
          return Promise.resolve({
            id: "msg1",
            content: "Message 1",
            author: { id: "user1" },
            reference: { messageId: "msg2" },
            channel: { messages: mockChannelMessages },
          });
        }
        if (id === "msg2") {
          return Promise.resolve({
            id: "msg2",
            content: "Message 2",
            author: { id: mockBotId },
            reference: { messageId: "msg1" },
            channel: { messages: mockChannelMessages },
          });
        }
        return Promise.reject(new Error("Not found"));
      }),
    };

    const mockMessageCurrent = {
      id: "msg3",
      content: "Current message",
      reference: {
        messageId: "msg1",
      },
      author: {
        id: "user1",
      },
      channel: {
        messages: mockChannelMessages,
      },
    } as unknown as Message;

    const result = await buildConversationContext(
      mockMessageCurrent,
      mockBotId
    );

    // Should not throw and should have some messages
    expect(Array.isArray(result)).toBe(true);
  });
});
