import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const messagingTools: Tool[] = [
  {
    name: "post_message",
    description:
      "Post a message to a Slack channel, group, or DM. Supports threading, custom display name/avatar, and Block Kit.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID or name (e.g. C123456 or #general)" },
        text: { type: "string", description: "Message text (supports Slack mrkdwn)" },
        thread_ts: { type: "string", description: "Reply in thread — parent message timestamp" },
        username: { type: "string", description: "Override the bot display name for this message" },
        icon_emoji: { type: "string", description: "Override bot icon with emoji (e.g. :robot_face:)" },
        icon_url: { type: "string", description: "Override bot icon with image URL" },
        blocks: { type: "array", description: "Block Kit blocks (JSON array) — overrides text if provided" },
        unfurl_links: { type: "boolean", description: "Enable link previews (default true)" },
      },
      required: ["channel"],
    },
  },
  {
    name: "update_message",
    description: "Update an existing Slack message by channel and timestamp.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID containing the message" },
        ts: { type: "string", description: "Timestamp of the message to update" },
        text: { type: "string", description: "New message text" },
        blocks: { type: "array", description: "New Block Kit blocks" },
      },
      required: ["channel", "ts"],
    },
  },
  {
    name: "delete_message",
    description: "Delete a Slack message. Only works for messages posted by the bot.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        ts: { type: "string", description: "Timestamp of the message to delete" },
      },
      required: ["channel", "ts"],
    },
  },
  {
    name: "schedule_message",
    description: "Schedule a message to be sent at a future time.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID or name" },
        text: { type: "string", description: "Message text" },
        post_at: { type: "number", description: "Unix timestamp (seconds) for when to send the message" },
        thread_ts: { type: "string", description: "Post as a thread reply" },
      },
      required: ["channel", "text", "post_at"],
    },
  },
  {
    name: "get_permalink",
    description: "Get a permanent URL to a specific Slack message.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel ID" },
        message_ts: { type: "string", description: "Message timestamp" },
      },
      required: ["channel", "message_ts"],
    },
  },
];
