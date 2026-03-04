import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const userTools: Tool[] = [
  {
    name: "list_users",
    description: "List all users in the Slack workspace.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max users to return (default 100)" },
        cursor: { type: "string", description: "Pagination cursor" },
      },
    },
  },
  {
    name: "get_user_info",
    description: "Get detailed information about a specific Slack user.",
    inputSchema: {
      type: "object",
      properties: {
        user: { type: "string", description: "User ID (e.g. U123456)" },
      },
      required: ["user"],
    },
  },
  {
    name: "get_user_presence",
    description: "Get the presence status of a Slack user (active, away, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        user: { type: "string", description: "User ID" },
      },
      required: ["user"],
    },
  },
  {
    name: "get_user_profile",
    description: "Get the profile fields of a Slack user, including custom fields.",
    inputSchema: {
      type: "object",
      properties: {
        user: { type: "string", description: "User ID" },
        include_labels: { type: "boolean", description: "Include field labels for custom profile fields" },
      },
      required: ["user"],
    },
  },
  {
    name: "lookup_user_by_email",
    description: "Find a Slack user by their email address.",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email address to look up" },
      },
      required: ["email"],
    },
  },
  {
    name: "set_user_presence",
    description: "Set the authenticated user's presence to auto or away.",
    inputSchema: {
      type: "object",
      properties: {
        presence: { type: "string", enum: ["auto", "away"], description: "'auto' to let Slack manage, 'away' to force away" },
      },
      required: ["presence"],
    },
  },
];
