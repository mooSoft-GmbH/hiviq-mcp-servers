import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const bookmarkTools: Tool[] = [
  {
    name: "list_bookmarks",
    description: "List all bookmarks in a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: { type: "string", description: "Channel ID" },
      },
      required: ["channel_id"],
    },
  },
  {
    name: "add_bookmark",
    description: "Add a bookmark to a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: { type: "string", description: "Channel ID" },
        title: { type: "string", description: "Bookmark title" },
        type: { type: "string", description: "Bookmark type (e.g. link)" },
        link: { type: "string", description: "URL for link-type bookmarks" },
        emoji: { type: "string", description: "Emoji to display with the bookmark (e.g. :bookmark:)" },
      },
      required: ["channel_id", "title", "type"],
    },
  },
  {
    name: "edit_bookmark",
    description: "Edit an existing bookmark in a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: { type: "string", description: "Channel ID" },
        bookmark_id: { type: "string", description: "Bookmark ID" },
        title: { type: "string", description: "New title" },
        link: { type: "string", description: "New URL" },
        emoji: { type: "string", description: "New emoji" },
      },
      required: ["channel_id", "bookmark_id"],
    },
  },
  {
    name: "remove_bookmark",
    description: "Remove a bookmark from a Slack channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: { type: "string", description: "Channel ID" },
        bookmark_id: { type: "string", description: "Bookmark ID to remove" },
      },
      required: ["channel_id", "bookmark_id"],
    },
  },
];
