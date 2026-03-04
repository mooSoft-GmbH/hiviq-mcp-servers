import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const linkTools: Tool[] = [
  {
    name: "list_link_types",
    description: "List available issue link types (e.g. Blocks, Clones, Relates to).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_link",
    description: "Create a link between two Jira issues.",
    inputSchema: {
      type: "object",
      properties: {
        typeName: {
          type: "string",
          description: "Link type name (e.g. Blocks, Clones, Relates)",
        },
        inwardIssueKey: { type: "string", description: "Inward issue key (e.g. PROJ-1)" },
        outwardIssueKey: { type: "string", description: "Outward issue key (e.g. PROJ-2)" },
      },
      required: ["typeName", "inwardIssueKey", "outwardIssueKey"],
    },
  },
  {
    name: "delete_link",
    description: "Delete an issue link by its link ID.",
    inputSchema: {
      type: "object",
      properties: {
        linkId: { type: "string", description: "Issue link ID" },
      },
      required: ["linkId"],
    },
  },
  {
    name: "list_remote_links",
    description: "List remote (external) links on a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueIdOrKey: { type: "string", description: "Issue key or ID" },
      },
      required: ["issueIdOrKey"],
    },
  },
];
