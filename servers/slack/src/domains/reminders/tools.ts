import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const reminderTools: Tool[] = [
  {
    name: "list_reminders",
    description: "List all reminders for the authenticated user.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "add_reminder",
    description: "Create a reminder for yourself or another user.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Reminder text" },
        time: { type: "string", description: "When to remind: Unix timestamp, or natural language like 'in 5 minutes', 'tomorrow at 9am'" },
        user: { type: "string", description: "User ID to remind (defaults to authenticated user)" },
      },
      required: ["text", "time"],
    },
  },
  {
    name: "delete_reminder",
    description: "Delete a reminder.",
    inputSchema: {
      type: "object",
      properties: {
        reminder: { type: "string", description: "Reminder ID" },
      },
      required: ["reminder"],
    },
  },
  {
    name: "complete_reminder",
    description: "Mark a reminder as complete.",
    inputSchema: {
      type: "object",
      properties: {
        reminder: { type: "string", description: "Reminder ID" },
      },
      required: ["reminder"],
    },
  },
];
