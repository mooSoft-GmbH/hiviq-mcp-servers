import { formatUnix } from "../../utils/format.js";
import type { Bookmark } from "../../types.js";

export function formatBookmark(b: Bookmark): string {
  const lines: string[] = [];
  const emoji = b.emoji ? `${b.emoji} ` : "";
  lines.push(`${emoji}**${b.title}**  ID: \`${b.id}\``);
  lines.push(`Type: ${b.type}`);
  if (b.link) lines.push(`Link: ${b.link}`);
  if (b.date_created) lines.push(`Created: ${formatUnix(b.date_created)}`);
  return lines.join("\n");
}

export function formatBookmarkList(bookmarks: Bookmark[], channelId: string): string {
  if (bookmarks.length === 0) return `No bookmarks in \`${channelId}\`.`;
  const lines = [`${bookmarks.length} bookmark(s) in \`${channelId}\`:\n`];
  for (const b of bookmarks) {
    const emoji = b.emoji ? `${b.emoji} ` : "";
    const link = b.link ? ` — ${b.link}` : "";
    lines.push(`- ${emoji}**${b.title}**${link} \`${b.id}\``);
  }
  return lines.join("\n");
}
