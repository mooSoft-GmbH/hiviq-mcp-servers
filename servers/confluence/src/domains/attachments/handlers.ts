import { z } from "zod";
import type { ConfluenceClient } from "../../client/confluence.js";
import type { ToolResult } from "../../types.js";
import { formatAttachmentList } from "./formatters.js";

export const ListAttachmentsInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
  limit: z.number().int().min(1).max(250).optional().default(25),
  mediaType: z.string().optional(),
});

export async function handleListAttachments(client: ConfluenceClient, baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId, limit, mediaType } = ListAttachmentsInput.parse(args);
  const response = await client.listAttachments(pageId, { limit, mediaType });
  return { content: [{ type: "text", text: formatAttachmentList(response.results, baseUrl) }] };
}
