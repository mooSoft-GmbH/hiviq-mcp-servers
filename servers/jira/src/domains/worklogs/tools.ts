import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const worklogTools: Tool[] = [
  {
    name: "list_worklogs",
    description: "List work logs for a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        startAt: { type: "number", description: "Pagination offset" },
        maxResults: { type: "number", description: "Max results" },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "add_worklog",
    description: "Log time spent on a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        timeSpent: {
          type: "string",
          description: "Time spent in Jira format (e.g. '2h 30m', '1d', '45m')",
        },
        started: {
          type: "string",
          description: "Start datetime in ISO format (default: now)",
        },
        comment: { type: "string", description: "Worklog comment" },
      },
      required: ["issueIdOrKey", "timeSpent"],
    },
  },
  {
    name: "update_worklog",
    description: "Update an existing work log entry.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        worklogId: { type: "string", description: "Worklog ID" },
        timeSpent: { type: "string", description: "New time spent" },
        started: { type: "string", description: "New start datetime" },
        comment: { type: "string", description: "New comment" },
      },
      required: ["issueIdOrKey", "worklogId"],
    },
  },
  {
    name: "delete_worklog",
    description: "Delete a work log entry from a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        worklogId: { type: "string", description: "Worklog ID" },
      },
      required: ["issueIdOrKey", "worklogId"],
    },
  },
];
