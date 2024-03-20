import { Events, EmbedBuilder } from "discord.js";
import { logs } from "../function/logs";
import { getParams } from "../function/base";

export const messageEditInit = (client) => {
  client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {});
};
