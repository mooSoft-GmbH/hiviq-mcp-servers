import { adfToMarkdown } from "../../utils/adf.js";
import type { JiraComment } from "../../types.js";

export function formatComment(comment: JiraComment): string {
  const author = comment.author?.displayName ?? "Unknown";
  const body = adfToMarkdown(comment.body ?? null);
  return [
    `**${author}** — ${comment.created} (ID: \`${comment.id}\`)`,
    "",
    body,
  ].join("\n");
}

export function formatCommentList(comments: JiraComment[], total: number): string {
  if (comments.length === 0) return "No comments found.";

  const lines = [`Showing ${comments.length} of ${total} comment(s):`, ""];
  for (const comment of comments) {
    lines.push(formatComment(comment));
    lines.push("---");
    lines.push("");
  }
  return lines.join("\n");
}
