import { storageToMarkdown } from "../../utils/html-to-markdown.js";
import type { Comment } from "../../types.js";

export function formatComment(comment: Comment): string {
  const lines = [
    `**Comment ID:** ${comment.id}`,
    `**Author:** ${comment.authorId}  |  **Created:** ${comment.createdAt}`,
  ];

  const storageValue = comment.body?.storage?.value;
  if (storageValue) {
    lines.push("", storageToMarkdown(storageValue));
  }

  return lines.join("\n");
}

export function formatCommentList(comments: Comment[]): string {
  if (comments.length === 0) return "No comments found.";

  return `Found ${comments.length} comment(s):\n\n` + comments.map(formatComment).join("\n\n---\n\n");
}
