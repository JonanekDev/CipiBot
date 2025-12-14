import { subscribeToTopic } from "@cipibot/kafka";
import { APIMessage } from "discord-api-types/v10";

subscribeToTopic<APIMessage>(
  "leveling-service-group",
  "discord.message.create", (message, key) => {
    console.log(`Received message with key ${key}: ${message.content}`);
    return Promise.resolve();
  }
);