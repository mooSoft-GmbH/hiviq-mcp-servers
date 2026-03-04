import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const sprintTools: Tool[] = [
  {
    name: "list_sprints",
    description: "List sprints for a Jira agile board.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: { type: "number", description: "Board ID" },
        startAt: { type: "number", description: "Pagination offset" },
        maxResults: { type: "number", description: "Max results (default 50)" },
        state: {
          type: "string",
          enum: ["active", "future", "closed"],
          description: "Filter by sprint state",
        },
      },
      required: ["boardId"],
    },
  },
  {
    name: "get_sprint",
    description: "Get details about a specific sprint.",
    inputSchema: {
      type: "object",
      properties: {
        sprintId: { type: "number", description: "Sprint ID" },
      },
      required: ["sprintId"],
    },
  },
  {
    name: "create_sprint",
    description: "Create a new sprint on a board.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Sprint name" },
        originBoardId: { type: "number", description: "Board ID to create the sprint on" },
        startDate: { type: "string", description: "Start date (ISO format)" },
        endDate: { type: "string", description: "End date (ISO format)" },
        goal: { type: "string", description: "Sprint goal" },
      },
      required: ["name", "originBoardId"],
    },
  },
  {
    name: "update_sprint",
    description: "Update an existing sprint (name, dates, goal, state).",
    inputSchema: {
      type: "object",
      properties: {
        sprintId: { type: "number", description: "Sprint ID" },
        name: { type: "string", description: "New sprint name" },
        state: {
          type: "string",
          enum: ["active", "closed"],
          description: "New state (start or complete a sprint)",
        },
        startDate: { type: "string", description: "New start date" },
        endDate: { type: "string", description: "New end date" },
        goal: { type: "string", description: "New goal" },
      },
      required: ["sprintId"],
    },
  },
  {
    name: "get_sprint_issues",
    description: "Get all issues in a sprint.",
    inputSchema: {
      type: "object",
      properties: {
        sprintId: { type: "number", description: "Sprint ID" },
        startAt: { type: "number", description: "Pagination offset" },
        maxResults: { type: "number", description: "Max results" },
        fields: { type: "string", description: "Comma-separated fields" },
      },
      required: ["sprintId"],
    },
  },
  {
    name: "move_issues_to_sprint",
    description: "Move one or more issues into a sprint.",
    inputSchema: {
      type: "object",
      properties: {
        sprintId: { type: "number", description: "Target sprint ID" },
        issueKeys: {
          type: "array",
          items: { type: "string" },
          description: "Issue keys to move (e.g. [\"PROJ-1\", \"PROJ-2\"])",
        },
      },
      required: ["sprintId", "issueKeys"],
    },
  },
];
