import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const issueTools: Tool[] = [
  {
    name: "get_issue",
    description:
      "Get detailed information about a Jira issue by its key (e.g. PROJ-123) or ID. Returns summary, status, assignee, description, and more.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key (e.g. PROJ-123) or numeric ID" },
        fields: {
          type: "string",
          description: "Comma-separated list of fields to return (default: all)",
        },
        expand: {
          type: "string",
          description: "Comma-separated list of expansions (e.g. changelog,renderedFields)",
        },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "create_issue",
    description:
      "Create a new Jira issue. Requires at minimum: project key, issue type name, and summary.",
    inputSchema: {
      type: "object",
      properties: {
        projectKey: { type: "string", description: "Project key (e.g. PROJ)" },
        issueType: { type: "string", description: "Issue type name (e.g. Task, Bug, Story)" },
        summary: { type: "string", description: "Issue summary/title" },
        description: {
          type: "string",
          description: "Issue description in plain text (will be converted to ADF)",
        },
        assigneeAccountId: { type: "string", description: "Account ID of the assignee" },
        priority: { type: "string", description: "Priority name (e.g. High, Medium, Low)" },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to apply to the issue",
        },
        parentKey: {
          type: "string",
          description: "Parent issue key for sub-tasks (e.g. PROJ-100)",
        },
        components: {
          type: "array",
          items: { type: "string" },
          description: "Component names to associate with the issue",
        },
      },
      required: ["projectKey", "issueType", "summary"],
    },
  },
  {
    name: "update_issue",
    description: "Update fields on an existing Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        summary: { type: "string", description: "New summary" },
        description: { type: "string", description: "New description in plain text" },
        assigneeAccountId: {
          type: "string",
          description: "New assignee account ID (empty string to unassign)",
        },
        priority: { type: "string", description: "New priority name" },
        labels: { type: "array", items: { type: "string" }, description: "New labels" },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "delete_issue",
    description: "Delete a Jira issue. This action is irreversible.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID to delete" },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "assign_issue",
    description:
      "Assign a Jira issue to a user, or unassign by passing null.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        accountId: {
          type: ["string", "null"],
          description: "Account ID of the assignee, or null to unassign",
        },
      },
      required: ["issueIdOrKey", "accountId"],
    },
  },
  {
    name: "get_transitions",
    description:
      "Get the available workflow transitions for a Jira issue (used before transition_issue).",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "transition_issue",
    description:
      "Move a Jira issue through its workflow by performing a transition (e.g. To Do → In Progress → Done).",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        transitionId: {
          type: "string",
          description: "Transition ID (use get_transitions to find available ones)",
        },
      },
      required: ["issueIdOrKey", "transitionId"],
    },
  },
  {
    name: "list_issue_types",
    description:
      "List available issue types, optionally filtered by project.",
    inputSchema: {
      type: "object",
      properties: {
        projectIdOrKey: {
          type: "string",
          description: "Project key or ID to filter types for (optional)",
        },
      },
    },
  },
  {
    name: "get_issue_changelogs",
    description: "Get the changelog (history of changes) for a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
        startAt: { type: "number", description: "Pagination offset (default 0)" },
        maxResults: { type: "number", description: "Max results (default 100)" },
      },
      required: ["issueIdOrKey"],
    },
  },
  {
    name: "bulk_get_issues",
    description: "Get multiple Jira issues by their keys or IDs in a single request.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdsOrKeys: {
          type: "array",
          items: { type: "string" },
          description: "Array of issue keys or IDs (e.g. [\"PROJ-1\", \"PROJ-2\"])",
        },
        fields: {
          type: "string",
          description: "Comma-separated fields to return",
        },
      },
      required: ["issueIdsOrKeys"],
    },
  },
];
