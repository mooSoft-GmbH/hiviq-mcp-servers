import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const boardTools: Tool[] = [
  {
    name: "list_boards",
    description: "List Jira agile boards, optionally filtered by type, name, or project.",
    inputSchema: {
      type: "object",
      properties: {
        startAt: { type: "number", description: "Pagination offset" },
        maxResults: { type: "number", description: "Max results (default 50)" },
        type: {
          type: "string",
          enum: ["scrum", "kanban", "simple"],
          description: "Filter by board type",
        },
        name: { type: "string", description: "Filter by board name (partial match)" },
        projectKeyOrId: { type: "string", description: "Filter by project key or ID" },
      },
    },
  },
  {
    name: "get_board",
    description: "Get details about a specific Jira agile board.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: { type: "number", description: "Board ID" },
      },
      required: ["boardId"],
    },
  },
  {
    name: "get_board_configuration",
    description: "Get the configuration of a Jira agile board (columns, estimation, ranking).",
    inputSchema: {
      type: "object",
      properties: {
        boardId: { type: "number", description: "Board ID" },
      },
      required: ["boardId"],
    },
  },
  {
    name: "create_board",
    description:
      "Create a new Jira agile board. Requires a saved filter (use create_filter first with a JQL like `project = PROJ ORDER BY rank`).",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Board name" },
        type: {
          type: "string",
          enum: ["scrum", "kanban"],
          description: "Board type",
        },
        filterId: {
          type: "number",
          description: "ID of a saved filter (create one with create_filter)",
        },
      },
      required: ["name", "type", "filterId"],
    },
  },
  {
    name: "delete_board",
    description: "Delete a Jira agile board. This action is irreversible.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: { type: "number", description: "Board ID to delete" },
      },
      required: ["boardId"],
    },
  },
];
