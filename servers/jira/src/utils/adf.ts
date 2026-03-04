/**
 * Converts Atlassian Document Format (ADF) JSON to Markdown.
 * Handles the most common node types used in Jira issue descriptions and comments.
 */

import type { AdfDocument, AdfNode } from "../types.js";

export function adfToMarkdown(doc: AdfDocument | null | undefined): string {
  if (!doc?.content) return "";
  return renderNodes(doc.content).trim();
}

function renderNodes(nodes: AdfNode[]): string {
  return nodes.map(renderNode).join("");
}

function renderNode(node: AdfNode): string {
  switch (node.type) {
    case "paragraph":
      return renderInlineContent(node) + "\n\n";

    case "heading": {
      const level = (node.attrs?.["level"] as number) ?? 1;
      return "#".repeat(level) + " " + renderInlineContent(node) + "\n\n";
    }

    case "text":
      return applyMarks(node.text ?? "", node.marks);

    case "hardBreak":
      return "\n";

    case "bulletList":
      return renderList(node, false) + "\n";

    case "orderedList":
      return renderList(node, true) + "\n";

    case "listItem":
      return renderNodes(node.content ?? []);

    case "blockquote":
      return (
        renderNodes(node.content ?? [])
          .trim()
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n") + "\n\n"
      );

    case "codeBlock": {
      const lang = (node.attrs?.["language"] as string) ?? "";
      const code = (node.content ?? []).map((n) => n.text ?? "").join("");
      return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    }

    case "rule":
      return "---\n\n";

    case "table":
      return renderTable(node) + "\n\n";

    case "mediaSingle":
    case "mediaGroup":
      return renderNodes(node.content ?? []);

    case "media": {
      const alt = (node.attrs?.["alt"] as string) ?? "attachment";
      const id = node.attrs?.["id"] as string;
      return id ? `![${alt}](attachment:${id})\n` : "";
    }

    case "inlineCard": {
      const url = node.attrs?.["url"] as string;
      return url ? `[${url}](${url})` : "";
    }

    case "mention": {
      const text = node.attrs?.["text"] as string;
      return text ?? "@unknown";
    }

    case "emoji": {
      const shortName = node.attrs?.["shortName"] as string;
      return shortName ?? "";
    }

    case "panel": {
      const panelType = (node.attrs?.["panelType"] as string) ?? "info";
      const content = renderNodes(node.content ?? []).trim();
      return `> **${panelType.toUpperCase()}:** ${content}\n\n`;
    }

    case "expand": {
      const title = (node.attrs?.["title"] as string) ?? "Details";
      const content = renderNodes(node.content ?? []).trim();
      return `<details>\n<summary>${title}</summary>\n\n${content}\n</details>\n\n`;
    }

    case "status": {
      const text = (node.attrs?.["text"] as string) ?? "";
      return `[${text}]`;
    }

    case "date": {
      const timestamp = node.attrs?.["timestamp"] as string;
      return timestamp ? new Date(Number(timestamp)).toISOString().slice(0, 10) : "";
    }

    default:
      if (node.content) return renderNodes(node.content);
      return node.text ?? "";
  }
}

function renderInlineContent(node: AdfNode): string {
  if (!node.content) return "";
  return node.content.map(renderNode).join("");
}

function applyMarks(
  text: string,
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>,
): string {
  if (!marks || marks.length === 0) return text;

  let result = text;
  for (const mark of marks) {
    switch (mark.type) {
      case "strong":
        result = `**${result}**`;
        break;
      case "em":
        result = `*${result}*`;
        break;
      case "code":
        result = `\`${result}\``;
        break;
      case "strike":
        result = `~~${result}~~`;
        break;
      case "link": {
        const href = mark.attrs?.["href"] as string;
        if (href) result = `[${result}](${href})`;
        break;
      }
      case "underline":
        result = `<u>${result}</u>`;
        break;
      case "subsup": {
        const type = mark.attrs?.["type"] as string;
        if (type === "sub") result = `<sub>${result}</sub>`;
        else if (type === "sup") result = `<sup>${result}</sup>`;
        break;
      }
    }
  }
  return result;
}

function renderList(node: AdfNode, ordered: boolean, depth = 0): string {
  const items = node.content ?? [];
  const indent = "  ".repeat(depth);
  return items
    .map((item, i) => {
      const prefix = ordered ? `${i + 1}.` : "-";
      const parts = item.content ?? [];
      const lines: string[] = [];
      for (const part of parts) {
        if (part.type === "bulletList") {
          lines.push(renderList(part, false, depth + 1));
        } else if (part.type === "orderedList") {
          lines.push(renderList(part, true, depth + 1));
        } else {
          const text = renderNode(part).replace(/\n+$/, "");
          if (lines.length === 0) {
            lines.push(`${indent}${prefix} ${text}`);
          } else {
            lines.push(`${indent}  ${text}`);
          }
        }
      }
      return lines.join("\n");
    })
    .join("\n");
}

function renderTable(node: AdfNode): string {
  const rows = node.content ?? [];
  if (rows.length === 0) return "";

  const tableData: string[][] = [];
  let isHeaderRow = false;

  for (const row of rows) {
    const cells: string[] = [];
    for (const cell of row.content ?? []) {
      const text = renderNodes(cell.content ?? []).replace(/\n+/g, " ").trim();
      cells.push(text);
      if (cell.type === "tableHeader") isHeaderRow = true;
    }
    tableData.push(cells);
  }

  if (tableData.length === 0) return "";

  const maxCols = Math.max(...tableData.map((r) => r.length));
  const normalized = tableData.map((r) => {
    while (r.length < maxCols) r.push("");
    return r;
  });

  const lines: string[] = [];
  const firstRow = normalized[0];
  if (firstRow) {
    lines.push("| " + firstRow.join(" | ") + " |");
    lines.push("| " + firstRow.map(() => "---").join(" | ") + " |");
  }

  const dataRows = isHeaderRow ? normalized.slice(1) : normalized;
  if (!isHeaderRow && firstRow) {
    // Re-add first row as data if it wasn't a header
    lines.length = 0;
    lines.push("| " + firstRow.map(() => " ").join(" | ") + " |");
    lines.push("| " + firstRow.map(() => "---").join(" | ") + " |");
    for (const row of normalized) {
      lines.push("| " + row.join(" | ") + " |");
    }
  } else {
    for (const row of dataRows) {
      lines.push("| " + row.join(" | ") + " |");
    }
  }

  return lines.join("\n");
}

/**
 * Creates a simple ADF document from plain text.
 * Useful for creating comments and descriptions from user input.
 */
export function textToAdf(text: string): AdfDocument {
  return {
    version: 1,
    type: "doc",
    content: text.split("\n\n").map((paragraph) => ({
      type: "paragraph",
      content: paragraph
        ? [{ type: "text", text: paragraph }]
        : [],
    })),
  };
}
