import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const spaceTools: Tool[] = [
  {
    name: "list_spaces",
    description: "List all Confluence spaces the authenticated user can access. Supports filtering by type and status.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max spaces to return (1–250, default 25)" },
        type: { type: "string", enum: ["global", "personal"], description: "Filter by space type" },
        status: { type: "string", enum: ["current", "archived"], description: "Filter by status" },
      },
    },
  },
  {
    name: "get_space",
    description: "Get detailed information about a specific Confluence space by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string", description: "The space ID (numeric string)" },
      },
      required: ["spaceId"],
    },
  },
];
