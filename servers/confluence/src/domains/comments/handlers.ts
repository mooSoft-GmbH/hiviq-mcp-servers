import { z } from "zod";
import type { ConfluenceClient } from "../../client/confluence.js";
import type { ToolResult } from "../../types.js";
import { formatCommentList } from "./formatters.js";

export const ListCommentsInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
  limit: z.number().int().min(1).max(250).optional().default(25),
});

export const AddCommentInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
  content: z.string().min(1, "content (Confluence storage format) is required"),
});

export async function handleListComments(client: ConfluenceClient, _baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId, limit } = ListCommentsInput.parse(args);
  const response = await client.listFooterComments(pageId, { limit });
  return { content: [{ type: "text", text: formatCommentList(response.results) }] };
}

export async function handleAddComment(client: ConfluenceClient, _baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId, content } = AddCommentInput.parse(args);
  const comment = await client.addFooterComment(pageId, { value: content, representation: "storage" });
  return {
    content: [{ type: "text", text: `Comment added successfully!\n\n**Comment ID:** ${comment.id}` }],
  };
}
