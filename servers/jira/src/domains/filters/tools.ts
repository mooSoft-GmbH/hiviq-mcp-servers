import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const filterTools: Tool[] = [
  {
    name: "list_my_filters",
    description: "List the current user's saved Jira filters.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_filter",
    description: "Get details of a specific Jira filter by ID.",
    inputSchema: {
      type: "object",
      properties: {
        filterId: { type: "string", description: "Filter ID" },
      },
      required: ["filterId"],
    },
  },
  {
    name: "create_filter",
    description: "Create a new saved Jira filter.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Filter name" },
        jql: { type: "string", description: "JQL query" },
        description: { type: "string", description: "Filter description" },
        favourite: { type: "boolean", description: "Mark as favourite" },
      },
      required: ["name", "jql"],
    },
  },
  {
    name: "update_filter",
    description: "Update an existing Jira filter.",
    inputSchema: {
      type: "object",
      properties: {
        filterId: { type: "string", description: "Filter ID" },
        name: { type: "string", description: "New name" },
        jql: { type: "string", description: "New JQL query" },
        description: { type: "string", description: "New description" },
        favourite: { type: "boolean", description: "Favourite status" },
      },
      required: ["filterId"],
    },
  },
  {
    name: "delete_filter",
    description: "Delete a saved Jira filter.",
    inputSchema: {
      type: "object",
      properties: {
        filterId: { type: "string", description: "Filter ID to delete" },
      },
      required: ["filterId"],
    },
  },
  {
    name: "list_dashboards",
    description: "List Jira dashboards.",
    inputSchema: {
      type: "object",
      properties: {
        startAt: { type: "number", description: "Pagination offset" },
        maxResults: { type: "number", description: "Max results" },
        filter: {
          type: "string",
          enum: ["my", "favourite"],
          description: "Filter dashboards",
        },
      },
    },
  },
  {
    name: "get_dashboard",
    description: "Get details of a specific Jira dashboard.",
    inputSchema: {
      type: "object",
      properties: {
        dashboardId: { type: "string", description: "Dashboard ID" },
      },
      required: ["dashboardId"],
    },
  },
  {
    name: "list_fields",
    description: "List all fields available in Jira (system and custom).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "search_fields",
    description: "Search Jira fields by name or type.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        type: {
          type: "string",
          enum: ["custom", "system"],
          description: "Filter by field type",
        },
        startAt: { type: "number", description: "Pagination offset" },
        maxResults: { type: "number", description: "Max results" },
      },
    },
  },
  {
    name: "get_all_labels",
    description: "Get all labels used across Jira issues.",
    inputSchema: {
      type: "object",
      properties: {
        startAt: { type: "number", description: "Pagination offset" },
        maxResults: { type: "number", description: "Max results (default 1000)" },
      },
    },
  },
  {
    name: "list_priorities",
    description: "List all issue priorities configured in Jira.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_resolutions",
    description: "List all issue resolutions configured in Jira.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_statuses",
    description: "List all issue statuses configured in Jira.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_server_info",
    description: "Get Jira server/instance information (version, deployment type, base URL).",
    inputSchema: { type: "object", properties: {} },
  },
];
