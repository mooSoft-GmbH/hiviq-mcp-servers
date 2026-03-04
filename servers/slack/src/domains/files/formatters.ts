import { formatUnix, formatBytes } from "../../utils/format.js";
import type { SlackFile } from "../../types.js";

export function formatFile(f: SlackFile): string {
  const lines: string[] = [];
  lines.push(`**${f.title ?? f.name}**  ID: \`${f.id}\``);
  lines.push(`Filename: ${f.name}`);
  if (f.filetype) lines.push(`Type: ${f.filetype}${f.mimetype ? ` (${f.mimetype})` : ""}`);
  if (f.size !== undefined) lines.push(`Size: ${formatBytes(f.size)}`);
  if (f.created !== undefined) lines.push(`Uploaded: ${formatUnix(f.created)}`);
  if (f.user) lines.push(`Uploaded by: \`${f.user}\``);
  if (f.channels?.length) lines.push(`Channels: ${f.channels.map((c) => `\`${c}\``).join(", ")}`);
  if (f.permalink) lines.push(`Link: ${f.permalink}`);
  return lines.join("\n");
}

export function formatFileList(files: SlackFile[]): string {
  if (files.length === 0) return "No files found.";
  const lines = [`Found ${files.length} file(s):\n`];
  for (const f of files) {
    const size = f.size !== undefined ? ` ${formatBytes(f.size)}` : "";
    const type = f.filetype ? ` [${f.filetype}]` : "";
    lines.push(`- **${f.title ?? f.name}**${type}${size} \`${f.id}\``);
  }
  return lines.join("\n");
}
