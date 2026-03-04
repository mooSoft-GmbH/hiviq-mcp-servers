import { formatTs, formatUnix, truncate, decodeSlackText } from "../../utils/format.js";
import type { Conversation, Message } from "../../types.js";

export function formatConversation(c: Conversation): string {
  const type = c.is_im ? "DM" : c.is_mpim ? "Group DM" : c.is_private ? "Private" : "Public";
  const archived = c.is_archived ? " [archived]" : "";
  const name = c.name ? `#${c.name}` : `DM(${c.user ?? c.id})`;
  const lines = [`**${name}** (${type})${archived}  ID: \`${c.id}\``];
  if (c.topic?.value) lines.push(`Topic: ${c.topic.value}`);
  if (c.purpose?.value) lines.push(`Purpose: ${c.purpose.value}`);
  if (c.num_members !== undefined) lines.push(`Members: ${c.num_members}`);
  lines.push(`Created: ${formatUnix(c.created)}`);
  return lines.join("\n");
}

export function formatConversationList(channels: Conversation[]): string {
  if (channels.length === 0) return "No conversations found.";
  const header = `Found ${channels.length} conversation(s):\n`;
  return header + channels
    .map((c) => {
      const type = c.is_im ? "DM" : c.is_mpim ? "GroupDM" : c.is_private ? "private" : "public";
      const archived = c.is_archived ? " [archived]" : "";
      const name = c.name ? `#${c.name}` : `DM(${c.user ?? c.id})`;
      return `- **${name}**${archived} (\`${c.id}\`, ${type}${c.num_members ? `, ${c.num_members} members` : ""})`;
    })
    .join("\n");
}

export function formatMessageList(messages: Message[], channel: string): string {
  if (messages.length === 0) return `No messages found in ${channel}.`;
  const header = `${messages.length} message(s) from \`${channel}\`:\n\n`;
  return header + [...messages].reverse()
    .map((m) => {
      const who = m.username ?? m.user ?? m.bot_id ?? "unknown";
      const when = m.ts ? formatTs(m.ts) : "";
      const thread = m.reply_count ? ` [${m.reply_count} replies, ts: ${m.thread_ts}]` : "";
      const text = truncate(decodeSlackText(m.text ?? "*(no text)*"));
      return `**${who}** (${when})${thread}\n${text}`;
    })
    .join("\n\n---\n\n");
}
