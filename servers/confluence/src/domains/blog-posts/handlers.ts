import { z } from "zod";
import type { ConfluenceClient } from "../../client/confluence.js";
import type { ToolResult } from "../../types.js";
import { formatBlogPost, formatBlogPostList } from "./formatters.js";

export const ListBlogPostsInput = z.object({
  spaceId: z.string().optional(),
  limit: z.number().int().min(1).max(250).optional().default(25),
  status: z.enum(["current", "archived", "trashed"]).optional(),
});

export const GetBlogPostInput = z.object({
  blogPostId: z.string().min(1, "blogPostId is required"),
});

export async function handleListBlogPosts(client: ConfluenceClient, baseUrl: string, args: unknown): Promise<ToolResult> {
  const { spaceId, limit, status } = ListBlogPostsInput.parse(args);
  const response = await client.listBlogPosts({ spaceId, limit, status });
  return { content: [{ type: "text", text: formatBlogPostList(response.results, baseUrl) }] };
}

export async function handleGetBlogPost(client: ConfluenceClient, baseUrl: string, args: unknown): Promise<ToolResult> {
  const { blogPostId } = GetBlogPostInput.parse(args);
  const post = await client.getBlogPost(blogPostId);
  return { content: [{ type: "text", text: formatBlogPost(post, baseUrl) }] };
}
