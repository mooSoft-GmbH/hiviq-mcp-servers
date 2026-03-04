import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const watcherTools: Tool[] = [
  {
    name: "list_watchers",
    description: "List users watching a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "add_watcher",
    description: "Add a user as a watcher to a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        accountId: { type: "string", description: "Account ID of the user to add" },
      },
      required: ["issueIdOrKey", "accountId"],
    },
  },
  {
    name: "remove_watcher",
    description: "Remove a user from watching a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        accountId: { type: "string", description: "Account ID of the user to remove" },
      },
      required: ["issueIdOrKey", "accountId"],
    },
  },
];
