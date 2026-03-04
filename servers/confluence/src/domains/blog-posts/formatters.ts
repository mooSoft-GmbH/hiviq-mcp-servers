import { storageToMarkdown } from "../../utils/html-to-markdown.js";
import type { BlogPost } from "../../types.js";

export function formatBlogPost(post: BlogPost, baseUrl: string): string {
  const lines = [
    `# ${post.title}`,
    `**ID:** ${post.id}  |  **Space ID:** ${post.spaceId}  |  **Status:** ${post.status}`,
    `**Version:** ${post.version.number}  |  **Created:** ${post.createdAt}  |  **Author:** ${post.authorId}`,
  ];

  if (post._links?.webui) {
    lines.push(`**URL:** ${baseUrl}/wiki${post._links.webui}`);
  }

  const storageValue = post.body?.storage?.value;
  if (storageValue) {
    lines.push("", "---", "", storageToMarkdown(storageValue));
  }

  return lines.join("\n");
}

export function formatBlogPostList(posts: BlogPost[], baseUrl: string): string {
  if (posts.length === 0) return "No blog posts found.";

  const header = `Found ${posts.length} blog post(s):\n`;
  const rows = posts.map((p) => {
    const url = p._links?.webui ? ` — ${baseUrl}/wiki${p._links.webui}` : "";
    return `- **${p.title}** (ID: \`${p.id}\`, ${p.createdAt.slice(0, 10)})${url}`;
  });

  return header + rows.join("\n");
}
