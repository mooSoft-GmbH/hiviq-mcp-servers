import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const searchTools: Tool[] = [
  {
    name: "search_issues",
    description:
      "Search Jira issues using JQL (Jira Query Language). Example: `project = PROJ AND status = \"In Progress\" ORDER BY created DESC`.",
    inputSchema: {
      type: "object",
      properties: {
        jql: { type: "string", description: "JQL query string" },
        startAt: { type: "number", description: "Pagination offset (default 0)" },
        maxResults: { type: "number", description: "Max results to return (default 50, max 100)" },
        fields: {
          type: "string",
          description:
            "Comma-separated fields to return (default: summary,status,assignee,priority,issuetype)",
        },
      },
      required: ["jql"],
    },
  },
  {
    name: "search_text",
    description:
      "Full-text search across Jira issues. Searches summary, description, and comments.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Free-text search query" },
        projectKey: { type: "string", description: "Restrict search to this project" },
        maxResults: { type: "number", description: "Max results (default 25)" },
      },
      required: ["text"],
    },
  },
];
