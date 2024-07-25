import { Events, EmbedBuilder } from "discord.js";

export const messageEditInit = (client: {
  on: (
    arg0: Events,
    arg1: (oldMessage: any, newMessage: any) => Promise<void>
  ) => void;
}) => {
  client.on(
    Events.MessageUpdate,
    async (oldMessage: any, newMessage: any) => {}
  );
};
