import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const usergroupTools: Tool[] = [
  {
    name: "list_usergroups",
    description: "List all user groups (handles) in the Slack workspace.",
    inputSchema: {
      type: "object",
      properties: {
        include_disabled: { type: "boolean", description: "Include disabled user groups" },
        include_count: { type: "boolean", description: "Include member count for each group" },
        include_users: { type: "boolean", description: "Include the list of user IDs for each group" },
      },
    },
  },
  {
    name: "create_usergroup",
    description: "Create a new Slack user group.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "User group display name" },
        handle: { type: "string", description: "Mention handle (without @)" },
        description: { type: "string", description: "Description of the group" },
        channels: { type: "string", description: "Comma-separated channel IDs to associate with the group" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_usergroup",
    description: "Update the name, handle, description, or channels of an existing user group.",
    inputSchema: {
      type: "object",
      properties: {
        usergroup: { type: "string", description: "User group ID" },
        name: { type: "string", description: "New display name" },
        handle: { type: "string", description: "New mention handle" },
        description: { type: "string", description: "New description" },
        channels: { type: "string", description: "Comma-separated channel IDs" },
      },
      required: ["usergroup"],
    },
  },
  {
    name: "list_usergroup_members",
    description: "List the members of a Slack user group.",
    inputSchema: {
      type: "object",
      properties: {
        usergroup: { type: "string", description: "User group ID" },
        include_disabled: { type: "boolean", description: "Include disabled members" },
      },
      required: ["usergroup"],
    },
  },
  {
    name: "update_usergroup_members",
    description: "Replace the entire membership list of a Slack user group.",
    inputSchema: {
      type: "object",
      properties: {
        usergroup: { type: "string", description: "User group ID" },
        users: { type: "string", description: "Comma-separated user IDs that should be members" },
      },
      required: ["usergroup", "users"],
    },
  },
];
