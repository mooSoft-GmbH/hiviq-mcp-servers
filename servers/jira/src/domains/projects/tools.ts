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
    name: "create_project",
    description:
      "Create a new Jira project. Requires Jira admin permissions.",
    inputSchema: {
      type: "object",
      properties: {
        key: {
          type: "string",
          description: "Unique project key — uppercase letters (e.g. DEMO)",
        },
        name: { type: "string", description: "Project display name" },
        projectTypeKey: {
          type: "string",
          enum: ["software", "business", "service_desk"],
          description: "Project type (default: software)",
        },
        projectTemplateKey: {
          type: "string",
          description:
            "Project template key. Common values: 'com.pyxis.greenhopper.jira:gh-simplified-kanban-classic' (Kanban), 'com.pyxis.greenhopper.jira:gh-simplified-scrum-classic' (Scrum), 'com.pyxis.greenhopper.jira:gh-simplified-basic' (Basic)",
        },
        description: { type: "string", description: "Project description" },
        leadAccountId: {
          type: "string",
          description: "Account ID of the project lead (defaults to current user)",
        },
      },
      required: ["key", "name"],
    },
  },
  {
    name: "update_project",
    description: "Update an existing Jira project's name, description, or lead.",
    inputSchema: {
      type: "object",
      properties: {
        projectIdOrKey: { type: "string", description: "Project key or ID" },
        name: { type: "string", description: "New project name" },
        description: { type: "string", description: "New description" },
        leadAccountId: { type: "string", description: "New lead account ID" },
      },
      required: ["projectIdOrKey"],
    },
  },
  {
    name: "delete_project",
    description:
      "Delete a Jira project. This moves it to trash (can be restored within 60 days).",
    inputSchema: {
      type: "object",
      properties: {
        projectIdOrKey: { type: "string", description: "Project key or ID to delete" },
        enableUndo: {
          type: "boolean",
          description: "Allow undo/restore of deletion (default: true)",
        },
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
