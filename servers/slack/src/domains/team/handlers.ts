import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import type { Team } from "../../types.js";
import { formatTeam } from "./formatters.js";

export async function handleGetTeamInfo(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    team: z.string().optional(),
  }).parse(args);
  const res = await client.getTeamInfo(params);
  return { content: [{ type: "text", text: formatTeam(res.team as Team) }] };
}
