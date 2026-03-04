import { storageToMarkdown } from "../../utils/html-to-markdown.js";
import type { Ancestor, Page } from "../../types.js";

export function formatPage(page: Page, baseUrl: string): string {
  const lines: string[] = [
    `# ${page.title}`,
    `**ID:** ${page.id}  |  **Space ID:** ${page.spaceId}  |  **Status:** ${page.status}`,
    `**Version:** ${page.version.number}  |  **Created:** ${page.createdAt}  |  **Author:** ${page.authorId}`,
  ];

  if (page.parentId) {
    lines.push(`**Parent ID:** ${page.parentId}`);
  }

  if (page._links?.webui) {
    lines.push(`**URL:** ${baseUrl}/wiki${page._links.webui}`);
  }

  const storageValue = page.body?.storage?.value;
  if (storageValue) {
    lines.push("", "---", "", storageToMarkdown(storageValue));
  }

  return lines.join("\n");
}

export function formatPageList(pages: Page[], baseUrl: string): string {
  if (pages.length === 0) return "No pages found.";

  const header = `Found ${pages.length} page(s):\n`;
  const rows = pages.map((p) => {
    const url = p._links?.webui ? ` — ${baseUrl}/wiki${p._links.webui}` : "";
    return `- **${p.title}** (ID: \`${p.id}\`, v${p.version.number})${url}`;
  });

  return header + rows.join("\n");
}

export function formatAncestors(ancestors: Ancestor[]): string {
  if (ancestors.length === 0) return "This page has no ancestors (it is a root page).";
  const breadcrumb = ancestors.map((a) => `**${a.title}** (ID: \`${a.id}\`)`).join(" > ");
  return `Ancestor path:\n${breadcrumb}`;
}
