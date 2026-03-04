import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const projectTools: Tool[] = [
  {
    name: "list_projects",
    description: "List Jira projects accessible to the current user.",
    inputSchema: {
      type: "object",
      properties: {
        startAt: { type: "number", description: "Pagination offset (default 0)" },
        maxResults: { type: "number", description: "Max projects to return (default 50)" },
        orderBy: { type: "string", description: "Order by field (e.g. name, key)" },
      },
    },
  },
  {
    name: "get_project",
    description: "Get detailed information about a Jira project by key or ID.",
    inputSchema: {
      type: "object",
      properties: {
        projectIdOrKey: { type: "string", description: "Project key (e.g. PROJ) or numeric ID" },
      },
      required: ["projectIdOrKey"],
    },
  },
  {
    name: "list_project_components",
    description: "List components for a Jira project.",
    inputSchema: {
      type: "object",
      properties: {
        projectIdOrKey: { type: "string", description: "Project key or ID" },
      },
      required: ["projectIdOrKey"],
    },
  },
  {
    name: "list_project_versions",
    description: "List versions (releases) for a Jira project.",
    inputSchema: {
      type: "object",
      properties: {
        projectIdOrKey: { type: "string", description: "Project key or ID" },
        startAt: { type: "number", description: "Pagination offset" },
        maxResults: { type: "number", description: "Max results" },
        orderBy: { type: "string", description: "Order by field" },
      },
      required: ["projectIdOrKey"],
    },
  },
];
