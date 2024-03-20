import { Events, EmbedBuilder } from "discord.js";
import { logs } from "../function/logs";
import { getParams } from "../function/base";

const messageEditInit = (client) => {
  client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {});
};

export default { messageEditInit };
