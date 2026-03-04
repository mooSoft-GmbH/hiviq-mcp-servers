import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const pinTools: Tool[] = [
  {
    name: "list_pins",
    description: "List all pinned messages and files in a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
      },
      required: ["channel"],
    },
  },
  {
    name: "add_pin",
    description: "Pin a message to a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        timestamp: { type: "string", description: "Message timestamp (ts) to pin" },
      },
      required: ["channel", "timestamp"],
    },
  },
  {
    name: "remove_pin",
    description: "Remove a pinned message from a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        timestamp: { type: "string", description: "Message timestamp (ts) to unpin" },
      },
      required: ["channel", "timestamp"],
    },
  },
];
