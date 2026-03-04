import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const teamTools: Tool[] = [
  {
    name: "get_team_info",
    description: "Get information about the Slack workspace (team), including name, domain, and plan.",
    inputSchema: {
      type: "object",
      properties: {
        team: { type: "string", description: "Team ID (optional; defaults to the authenticated team)" },
      },
    },
  },
];
