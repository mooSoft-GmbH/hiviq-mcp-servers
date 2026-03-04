import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const attachmentTools: Tool[] = [
  {
    name: "list_attachments",
    description: "List attachments on a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "add_attachment",
    description: "Add a text file attachment to a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        filename: { type: "string", description: "Filename (e.g. notes.txt)" },
        content: { type: "string", description: "File content (text)" },
      },
      required: ["issueIdOrKey", "filename", "content"],
    },
  },
];
