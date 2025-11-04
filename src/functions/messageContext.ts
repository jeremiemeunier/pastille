import { Message } from "discord.js";
import Logs from "@libs/Logs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Regular expression to match Discord user mentions
 * Matches patterns like <@123456789> and <@!123456789>
 */
const MENTION_REGEX = /<@!?\d+>/g;

/**
 * Remove Discord mentions from message content
 * @param content - The message content to clean
 * @returns The content with mentions removed and trimmed
 */
export const removeMentions = (content: string): string => {
  return content.replace(MENTION_REGEX, "").trim();
};

/**
 * Build conversation context by fetching message history from reply chain
 * When a user replies to a bot message, this function traces back the conversation
 * and builds an array of messages for AI context
 * 
 * @param message - The Discord message object
 * @param botUserId - The bot's user ID to identify its messages
 * @returns Array of chat messages with role and content
 */
export const buildConversationContext = async (
  message: Message,
  botUserId: string
): Promise<ChatMessage[]> => {
  const conversationMessages: ChatMessage[] = [];
  
  try {
    let currentMessage: Message | null = message;
    const seenMessageIds = new Set<string>([message.id]);
    
    // Traverse the reply chain backwards to build context
    while (currentMessage && conversationMessages.length < 10) {
      // Check if this message is a reply
      if (currentMessage.reference?.messageId) {
        try {
          const referencedMessage: Message = await currentMessage.channel.messages.fetch(
            currentMessage.reference.messageId
          );
          
          // Avoid infinite loops
          if (seenMessageIds.has(referencedMessage.id)) {
            break;
          }
          seenMessageIds.add(referencedMessage.id);
          
          // Add the referenced message to context
          const role = referencedMessage.author.id === botUserId ? "assistant" : "user";
          conversationMessages.unshift({
            role,
            content: removeMentions(referencedMessage.content),
          });
          
          // Move to the next message in the chain
          currentMessage = referencedMessage;
        } catch (err: any) {
          // Message might be deleted or inaccessible
          Logs("message:context:fetch", "warning", err);
          break;
        }
      } else {
        // No more references, end of chain
        break;
      }
    }
  } catch (err: any) {
    Logs("message:context:build", "error", err);
  }
  
  return conversationMessages;
};
