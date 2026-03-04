import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const attachmentTools: Tool[] = [
  {
    name: "list_attachments",
    description: "List attachments on a Confluence page, with optional media type filter.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The page ID" },
        limit: { type: "number", description: "Max results (1–250, default 25)" },
        mediaType: { type: "string", description: "Filter by MIME type, e.g. image/png" },
      },
      required: ["pageId"],
    },
  },
];
