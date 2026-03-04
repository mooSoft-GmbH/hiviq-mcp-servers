import { z } from "zod";
import type { ConfluenceClient } from "../../client/confluence.js";
import type { ToolResult } from "../../types.js";
import { formatSpace, formatSpaceList } from "./formatters.js";

export const ListSpacesInput = z.object({
  limit: z.number().int().min(1).max(250).optional().default(25),
  type: z.enum(["global", "personal"]).optional(),
  status: z.enum(["current", "archived"]).optional(),
});

export const GetSpaceInput = z.object({
  spaceId: z.string().min(1, "spaceId is required"),
});

export async function handleListSpaces(
  client: ConfluenceClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { limit, type, status } = ListSpacesInput.parse(args);
  const response = await client.listSpaces({ limit, type, status });
  return { content: [{ type: "text", text: formatSpaceList(response.results, baseUrl) }] };
}

export async function handleGetSpace(
  client: ConfluenceClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { spaceId } = GetSpaceInput.parse(args);
  const space = await client.getSpace(spaceId);
  return { content: [{ type: "text", text: formatSpace(space, baseUrl) }] };
}
