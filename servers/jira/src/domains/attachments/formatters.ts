import type { JiraAttachment } from "../../types.js";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatAttachmentList(attachments: JiraAttachment[]): string {
  if (attachments.length === 0) return "No attachments found.";

  const lines = [`Found ${attachments.length} attachment(s):`, ""];
  for (const a of attachments) {
    const author = a.author?.displayName ?? "Unknown";
    lines.push(
      `- **${a.filename}** (${formatBytes(a.size)}, ${a.mimeType}) — by ${author}, ${a.created} — ID: \`${a.id}\``,
    );
  }
  return lines.join("\n");
}
