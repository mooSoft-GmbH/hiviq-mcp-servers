import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import type { SearchMessage, SearchFile } from "../../types.js";
import { formatSearchMessages, formatSearchFiles } from "./formatters.js";

export async function handleSearchMessages(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    query: z.string().min(1),
    sort: z.enum(["score", "timestamp"]).optional(),
    sort_dir: z.enum(["asc", "desc"]).optional(),
    count: z.number().int().min(1).max(100).optional().default(20),
    page: z.number().int().min(1).optional(),
  }).parse(args);
  const res = await client.searchMessages(params);
  const { matches, total } = res.messages as { matches: SearchMessage[]; total: number; pagination: unknown };
  return { content: [{ type: "text", text: formatSearchMessages(matches, total, params.query) }] };
}

export async function handleSearchFiles(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    query: z.string().min(1),
    sort: z.enum(["score", "timestamp"]).optional(),
    count: z.number().int().min(1).max(100).optional().default(20),
    page: z.number().int().min(1).optional(),
  }).parse(args);
  const res = await client.searchFiles(params);
  const { matches, total } = res.files as { matches: SearchFile[]; total: number };
  return { content: [{ type: "text", text: formatSearchFiles(matches, total, params.query) }] };
}
