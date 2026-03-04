/**
 * Converts Confluence storage format (XHTML-based) to Markdown.
 * Handles the most common elements without requiring a full DOM parser.
 */
export function storageToMarkdown(html: string): string {
  if (!html) return "";

  let md = html;

  // Code blocks (must come before inline code)
  md = md.replace(
    /<ac:structured-macro[^>]*ac:name="code"[^>]*>[\s\S]*?<ac:plain-text-body[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/ac:plain-text-body>[\s\S]*?<\/ac:structured-macro>/gi,
    (_, code) => `\`\`\`\n${code.trim()}\n\`\`\``,
  );

  // Headings
  md = md.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, content) =>
    `${"#".repeat(Number(level))} ${stripTags(content).trim()}`,
  );

  // Bold
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, content) => `**${stripTags(content)}**`);

  // Italic
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, content) => `*${stripTags(content)}*`);

  // Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, content) => `\`${content}\``);

  // Links — Confluence page links
  md = md.replace(/<ac:link[^>]*>[\s\S]*?<ri:page[^>]*ri:content-title="([^"]+)"[^/]*/gi, (_, title) => `[${title}]`);

  // Standard anchor links
  md = md.replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) =>
    `[${stripTags(text)}](${href})`,
  );

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items = [...content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    return items.map((m) => `- ${stripTags(m[1] ?? "").trim()}`).join("\n") + "\n";
  });

  // Ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    const items = [...content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    return items.map((m, i) => `${i + 1}. ${stripTags(m[1] ?? "").trim()}`).join("\n") + "\n";
  });

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, content) => {
    const rows = [...content.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const mdRows = rows.map((row) => {
      const cells = [...(row[1] ?? "").matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)];
      return "| " + cells.map((c) => stripTags(c[1] ?? "").trim()).join(" | ") + " |";
    });
    if (mdRows.length > 0) {
      const headerSep = "| " + (mdRows[0]?.split("|").slice(1, -1).map(() => "---").join(" | ") ?? "") + " |";
      mdRows.splice(1, 0, headerSep);
    }
    return mdRows.join("\n") + "\n";
  });

  // Blockquotes / panels
  md = md.replace(
    /<ac:structured-macro[^>]*ac:name="(panel|note|info|tip|warning)"[^>]*>[\s\S]*?<ac:rich-text-body[^>]*>([\s\S]*?)<\/ac:rich-text-body>[\s\S]*?<\/ac:structured-macro>/gi,
    (_, type, content) => `> **${type.toUpperCase()}**\n> ${stripTags(content).trim().split("\n").join("\n> ")}`,
  );

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, "\n---\n");

  // Paragraphs → newlines
  md = md.replace(/<\/p>/gi, "\n");
  md = md.replace(/<p[^>]*>/gi, "");

  // Line breaks
  md = md.replace(/<br[^>]*\/?>/gi, "\n");

  // Strip remaining tags
  md = stripTags(md);

  // Decode HTML entities
  md = decodeEntities(md);

  // Collapse excessive blank lines
  md = md.replace(/\n{3,}/g, "\n\n").trim();

  return md;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
