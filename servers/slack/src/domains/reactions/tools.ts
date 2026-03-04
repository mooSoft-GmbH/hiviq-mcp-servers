import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const reactionTools: Tool[] = [
  {
    name: "add_reaction",
    description: "Add an emoji reaction to a Slack message.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID containing the message" },
        timestamp: { type: "string", description: "Message timestamp (ts)" },
        name: { type: "string", description: "Emoji name without colons (e.g. thumbsup)" },
      },
      required: ["channel", "timestamp", "name"],
    },
  },
  {
    name: "remove_reaction",
    description: "Remove an emoji reaction from a Slack message.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID containing the message" },
        timestamp: { type: "string", description: "Message timestamp (ts)" },
        name: { type: "string", description: "Emoji name without colons (e.g. thumbsup)" },
      },
      required: ["channel", "timestamp", "name"],
    },
  },
  {
    name: "get_reactions",
    description: "Get all reactions on a Slack message.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID containing the message" },
        timestamp: { type: "string", description: "Message timestamp (ts)" },
        full: { type: "boolean", description: "Return the full list of users who reacted (default false)" },
      },
      required: ["channel", "timestamp"],
    },
  },
];
