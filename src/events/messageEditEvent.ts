import { Events, EmbedBuilder, Client } from "discord.js";

export const messageEditInit = (client: Client) => {
  client.on(
    Events.MessageUpdate,
    async (oldMessage: any, newMessage: any) => {}
  );
};
