import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const blogPostTools: Tool[] = [
  {
    name: "list_blog_posts",
    description: "List blog posts in Confluence, optionally filtered by space and status.",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string", description: "Filter by space ID" },
        limit: { type: "number", description: "Max results (1–250, default 25)" },
        status: { type: "string", enum: ["current", "archived", "trashed"], description: "Filter by status" },
      },
    },
  },
  {
    name: "get_blog_post",
    description: "Get the full content of a Confluence blog post, rendered as Markdown.",
    inputSchema: {
      type: "object",
      properties: {
        blogPostId: { type: "string", description: "The blog post ID" },
      },
      required: ["blogPostId"],
    },
  },
];
