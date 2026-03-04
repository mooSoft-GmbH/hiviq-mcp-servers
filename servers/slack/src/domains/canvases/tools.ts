import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const canvasTools: Tool[] = [
  {
    name: "create_canvas",
    description: "Create a new Slack canvas document.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Canvas title" },
        document_content: {
          type: "object",
          description: "Initial canvas content as a Slack document object (type + elements)",
        },
      },
    },
  },
  {
    name: "edit_canvas",
    description: "Apply changes to an existing Slack canvas.",
    inputSchema: {
      type: "object",
      properties: {
        canvas_id: { type: "string", description: "Canvas ID to edit" },
        changes: {
          type: "array",
          description: "Array of change operations (each with operation, section_id, document_content)",
          items: { type: "object" },
        },
      },
      required: ["canvas_id", "changes"],
    },
  },
  {
    name: "delete_canvas",
    description: "Permanently delete a Slack canvas.",
    inputSchema: {
      type: "object",
      properties: {
        canvas_id: { type: "string", description: "Canvas ID to delete" },
      },
      required: ["canvas_id"],
    },
  },
];
