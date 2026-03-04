import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const commentTools: Tool[] = [
  {
    name: "list_comments",
    description: "List footer comments on a Confluence page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The page ID" },
        limit: { type: "number", description: "Max comments to return (1–250, default 25)" },
      },
      required: ["pageId"],
    },
  },
  {
    name: "add_comment",
    description: "Add a footer comment to a Confluence page. Content must be in Confluence storage format.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The page ID to comment on" },
        content: { type: "string", description: "Comment body in Confluence storage format (XHTML)" },
      },
      required: ["pageId", "content"],
    },
  },
];
