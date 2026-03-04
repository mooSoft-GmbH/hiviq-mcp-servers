import type { Attachment } from "../../types.js";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatAttachmentList(attachments: Attachment[], baseUrl: string): string {
  if (attachments.length === 0) return "No attachments found.";

  const header = `Found ${attachments.length} attachment(s):\n`;
  const rows = attachments.map((a) => {
    const download = a._links?.download ? ` — [Download](${baseUrl}/wiki${a._links.download})` : "";
    return `- **${a.title}** (${a.mediaType}, ${formatBytes(a.fileSize)}, ID: \`${a.id}\`)${download}`;
  });

  return header + rows.join("\n");
}
