import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const epicTools: Tool[] = [
  {
    name: "get_epic",
    description: "Get details about a Jira epic.",
    inputSchema: {
      type: "object",
      properties: {
        epicIdOrKey: { type: "string", description: "Epic issue key or ID" },
      },
      required: ["epicIdOrKey"],
    },
  },
  {
    name: "get_epic_issues",
    description: "Get all issues belonging to an epic.",
    inputSchema: {
      type: "object",
      properties: {
        epicIdOrKey: { type: "string", description: "Epic issue key or ID" },
        startAt: { type: "number", description: "Pagination offset" },
        maxResults: { type: "number", description: "Max results" },
        fields: { type: "string", description: "Comma-separated fields" },
      },
      required: ["epicIdOrKey"],
    },
  },
  {
    name: "move_issues_to_epic",
    description: "Move one or more issues to an epic.",
    inputSchema: {
      type: "object",
      properties: {
        epicIdOrKey: { type: "string", description: "Target epic key or ID" },
        issueKeys: {
          type: "array",
          items: { type: "string" },
          description: "Issue keys to move",
        },
      },
      required: ["epicIdOrKey", "issueKeys"],
    },
  },
  {
    name: "move_issues_to_backlog",
    description: "Move one or more issues to the backlog (removes from any sprint).",
    inputSchema: {
      type: "object",
      properties: {
        issueKeys: {
          type: "array",
          items: { type: "string" },
          description: "Issue keys to move to backlog",
        },
      },
      required: ["issueKeys"],
    },
  },
  {
    name: "get_votes",
    description: "Get vote information for a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "add_vote",
    description: "Vote for a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "remove_vote",
    description: "Remove your vote from a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
      },
      required: ["issueIdOrKey"],
    },
  },
];
