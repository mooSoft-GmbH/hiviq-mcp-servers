import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const commentTools: Tool[] = [
  {
    name: "list_comments",
    description: "List comments on a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        startAt: { type: "number", description: "Pagination offset (default 0)" },
        maxResults: { type: "number", description: "Max results (default 50)" },
        orderBy: {
          type: "string",
          enum: ["created", "-created"],
          description: "Order by created date (prefix with - for descending)",
        },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "add_comment",
    description: "Add a comment to a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        body: { type: "string", description: "Comment text (plain text, will be converted to ADF)" },
      },
      required: ["issueIdOrKey", "body"],
    },
  },
  {
    name: "update_comment",
    description: "Update an existing comment on a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        commentId: { type: "string", description: "Comment ID" },
        body: { type: "string", description: "Updated comment text" },
      },
      required: ["issueIdOrKey", "commentId", "body"],
    },
  },
  {
    name: "delete_comment",
    description: "Delete a comment from a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        commentId: { type: "string", description: "Comment ID" },
      },
      required: ["issueIdOrKey", "commentId"],
    },
  },
];
