import { formatUnix, formatTs, truncate, decodeSlackText } from "../../utils/format.js";
import type { PinItem } from "../../types.js";

export function formatPinList(items: PinItem[], channel: string): string {
  if (items.length === 0) return `No pins in \`${channel}\`.`;
  const lines = [`${items.length} pinned item(s) in \`${channel}\`:\n`];
  for (const item of items) {
    if (item.type === "message" && item.message) {
      const m = item.message;
      const who = m.username ?? m.user ?? m.bot_id ?? "unknown";
      const when = m.ts ? formatTs(m.ts) : "";
      const text = truncate(decodeSlackText(m.text ?? "*(no text)*"));
      const pinnedAt = item.created ? ` (pinned ${formatUnix(item.created)})` : "";
      lines.push(`- **Message** by **${who}** (${when})${pinnedAt}\n  ${text}`);
    } else if (item.type === "file" && item.file) {
      const f = item.file;
      const pinnedAt = item.created ? ` (pinned ${formatUnix(item.created)})` : "";
      lines.push(`- **File**: ${f.title ?? f.name} \`${f.id}\`${pinnedAt}`);
    } else {
      lines.push(`- ${item.type} item`);
    }
  }
  return lines.join("\n");
}
