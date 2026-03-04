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
];
