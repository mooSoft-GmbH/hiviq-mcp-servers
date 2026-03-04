import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const searchTools: Tool[] = [
  {
    name: "search_messages",
    description: "Search for messages across Slack. Requires a user token (SLACK_USER_TOKEN) — bot tokens cannot use search.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query string (supports Slack search modifiers like in:, from:, before:)" },
        sort: { type: "string", enum: ["score", "timestamp"], description: "Sort by relevance (score) or date (timestamp)" },
        sort_dir: { type: "string", enum: ["asc", "desc"], description: "Sort direction" },
        count: { type: "number", description: "Results per page (default 20, max 100)" },
        page: { type: "number", description: "Page number (1-based)" },
      },
      required: ["query"],
    },
  },
  {
    name: "search_files",
    description: "Search for files shared in Slack. Requires a user token (SLACK_USER_TOKEN) — bot tokens cannot use search.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query string" },
        sort: { type: "string", enum: ["score", "timestamp"], description: "Sort by relevance or date" },
        count: { type: "number", description: "Results per page (default 20, max 100)" },
        page: { type: "number", description: "Page number (1-based)" },
      },
      required: ["query"],
    },
  },
];
