import { z } from "zod";
import type { ConfluenceClient } from "../../client/confluence.js";
import type { ToolResult } from "../../types.js";
import { formatSearchResults } from "./formatters.js";

export const SearchInput = z.object({
  cql: z.string().min(1, "cql query is required"),
  limit: z.number().int().min(1).max(100).optional().default(25),
  start: z.number().int().min(0).optional().default(0),
  excerpt: z.enum(["indexed", "highlight", "none"]).optional().default("highlight"),
});

export const SearchTextInput = z.object({
  text: z.string().min(1, "text is required"),
  spaceKey: z.string().optional(),
  type: z.enum(["page", "blogpost", "comment", "attachment"]).optional(),
  limit: z.number().int().min(1).max(100).optional().default(25),
});

export async function handleSearch(client: ConfluenceClient, _baseUrl: string, args: unknown): Promise<ToolResult> {
  const { cql, limit, start, excerpt } = SearchInput.parse(args);
  const response = await client.search({ cql, limit, start, excerpt });
  return { content: [{ type: "text", text: formatSearchResults(response) }] };
}

export async function handleSearchText(client: ConfluenceClient, _baseUrl: string, args: unknown): Promise<ToolResult> {
  const { text, spaceKey, type, limit } = SearchTextInput.parse(args);

  let cql = `text ~ "${text.replace(/"/g, '\\"')}"`;
  if (spaceKey) cql += ` AND space.key = "${spaceKey}"`;
  if (type) cql += ` AND type = "${type}"`;
  cql += " ORDER BY lastmodified DESC";

  const response = await client.search({ cql, limit, excerpt: "highlight" });
  return { content: [{ type: "text", text: formatSearchResults(response) }] };
}
