import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const userTools: Tool[] = [
  {
    name: "get_myself",
    description: "Get information about the currently authenticated Jira user.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_user",
    description: "Get information about a Jira user by their account ID.",
    inputSchema: {
      type: "object",
      properties: {
        accountId: { type: "string", description: "The user's account ID" },
      },
      required: ["accountId"],
    },
  },
  {
    name: "search_users",
    description: "Search for Jira users by name or email.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (name or email)" },
        startAt: { type: "number", description: "Pagination offset" },
        maxResults: { type: "number", description: "Max results (default 50)" },
      },
      required: ["query"],
    },
  },
  {
    name: "find_users_assignable",
    description: "Find users who can be assigned to issues in a project or specific issue.",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string", description: "Project key" },
        issueKey: { type: "string", description: "Issue key (alternative to project)" },
        query: { type: "string", description: "Filter by name" },
        maxResults: { type: "number", description: "Max results (default 50)" },
      },
    },
  },
];
