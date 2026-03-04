import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const conversationTools: Tool[] = [
  {
    name: "list_conversations",
    description: "List Slack channels and conversations. Filters by type: public channels, private groups, DMs, multi-person DMs.",
    inputSchema: {
      type: "object",
      properties: {
        types: { type: "string", description: "Comma-separated: public_channel, private_channel, im, mpim (default: public_channel)" },
        limit: { type: "number", description: "Max results (default 100)" },
        cursor: { type: "string", description: "Pagination cursor" },
        exclude_archived: { type: "boolean", description: "Exclude archived channels (default true)" },
      },
    },
  },
  {
    name: "get_conversation_info",
    description: "Get detailed information about a specific Slack channel or conversation.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID (e.g. C123456)" },
      },
      required: ["channel"],
    },
  },
  {
    name: "get_conversation_history",
    description: "Fetch message history from a Slack channel, DM, or group.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        limit: { type: "number", description: "Number of messages to return (default 20, max 999)" },
        oldest: { type: "string", description: "Start of time range (Unix timestamp)" },
        latest: { type: "string", description: "End of time range (Unix timestamp)" },
        inclusive: { type: "boolean", description: "Include messages with oldest/latest timestamps" },
      },
      required: ["channel"],
    },
  },
  {
    name: "get_conversation_replies",
    description: "Get all replies in a message thread.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        ts: { type: "string", description: "Timestamp of the parent (thread root) message" },
        limit: { type: "number", description: "Max replies to return (default 20)" },
      },
      required: ["channel", "ts"],
    },
  },
  {
    name: "create_conversation",
    description: "Create a new Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Channel name (lowercase, no spaces)" },
        is_private: { type: "boolean", description: "Make channel private (default false)" },
      },
      required: ["name"],
    },
  },
  {
    name: "archive_conversation",
    description: "Archive a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID to archive" },
      },
      required: ["channel"],
    },
  },
  {
    name: "join_conversation",
    description: "Join a public Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID to join" },
      },
      required: ["channel"],
    },
  },
  {
    name: "leave_conversation",
    description: "Leave a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID to leave" },
      },
      required: ["channel"],
    },
  },
  {
    name: "rename_conversation",
    description: "Rename a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        name: { type: "string", description: "New channel name" },
      },
      required: ["channel", "name"],
    },
  },
  {
    name: "invite_to_conversation",
    description: "Invite one or more users to a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        users: { type: "string", description: "Comma-separated user IDs (e.g. U123,U456)" },
      },
      required: ["channel", "users"],
    },
  },
  {
    name: "kick_from_conversation",
    description: "Remove a user from a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        user: { type: "string", description: "User ID to remove" },
      },
      required: ["channel", "user"],
    },
  },
  {
    name: "open_direct_message",
    description: "Open or get a direct message (DM) or multi-person DM channel with one or more users.",
    inputSchema: {
      type: "object",
      properties: {
        users: { type: "string", description: "Comma-separated user IDs to open a DM with" },
      },
      required: ["users"],
    },
  },
  {
    name: "set_conversation_topic",
    description: "Set the topic of a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        topic: { type: "string", description: "New topic text" },
      },
      required: ["channel", "topic"],
    },
  },
  {
    name: "set_conversation_purpose",
    description: "Set the purpose/description of a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        purpose: { type: "string", description: "New purpose text" },
      },
      required: ["channel", "purpose"],
    },
  },
];
