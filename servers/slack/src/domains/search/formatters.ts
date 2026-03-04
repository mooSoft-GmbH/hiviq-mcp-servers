import { formatTs, truncate, decodeSlackText } from "../../utils/format.js";
import type { SearchMessage, SearchFile } from "../../types.js";

export function formatSearchMessages(matches: SearchMessage[], total: number, query: string): string {
  if (matches.length === 0) return `No messages found for query: "${query}"`;
  const lines = [`**${total}** message(s) matching "${query}" — showing ${matches.length}:\n`];
  for (const m of matches) {
    const when = m.ts ? formatTs(m.ts) : "";
    const channel = m.channel?.name ? `#${m.channel.name}` : m.channel?.id ?? "";
    const text = truncate(decodeSlackText(m.text ?? "*(no text)*"));
    lines.push(`**${m.username}** in ${channel} (${when})\n${text}\n<${m.permalink}>`);
    lines.push("---");
  }
  if (lines[lines.length - 1] === "---") lines.pop();
  return lines.join("\n");
}

export function formatSearchFiles(matches: SearchFile[], total: number, query: string): string {
  if (matches.length === 0) return `No files found for query: "${query}"`;
  const lines = [`**${total}** file(s) matching "${query}" — showing ${matches.length}:\n`];
  for (const f of matches) {
    const channels = f.channels?.length ? ` in ${f.channels.map((c) => `\`${c}\``).join(", ")}` : "";
    const mime = f.mimetype ? ` (${f.mimetype})` : "";
    lines.push(`- **${f.title ?? f.name}**${mime}${channels} \`${f.id}\``);
    if (f.permalink) lines.push(`  ${f.permalink}`);
  }
  return lines.join("\n");
}
