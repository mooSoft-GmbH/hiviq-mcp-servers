import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const labelTools: Tool[] = [
  {
    name: "list_labels",
    description: "List all labels on a Confluence page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The page ID" },
      },
      required: ["pageId"],
    },
  },
  {
    name: "add_label",
    description: "Add a label to a Confluence page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The page ID" },
        name: { type: "string", description: "Label name (lowercase, no spaces)" },
        prefix: { type: "string", description: "Label prefix (default: global)" },
      },
      required: ["pageId", "name"],
    },
  },
  {
    name: "remove_label",
    description: "Remove a label from a Confluence page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The page ID" },
        name: { type: "string", description: "Label name to remove" },
        prefix: { type: "string", description: "Label prefix (default: global)" },
      },
      required: ["pageId", "name"],
    },
  },
];
