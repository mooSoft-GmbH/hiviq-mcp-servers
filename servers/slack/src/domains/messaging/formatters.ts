import { decodeSlackText, formatTs } from "../../utils/format.js";

export function formatPostedMessage(ts: string, channel: string): string {
  return `Message posted successfully.\n**Channel:** ${channel}\n**Timestamp:** ${ts}\n**Sent at:** ${formatTs(ts)}`;
}

export function formatScheduledMessage(id: string, channel: string, postAt: number): string {
  return `Message scheduled.\n**ID:** ${id}\n**Channel:** ${channel}\n**Sends at:** ${new Date(postAt * 1000).toISOString().replace("T", " ").slice(0, 19)} UTC`;
}

export function formatPermalink(permalink: string, channel: string): string {
  return `**Permalink:** ${permalink}\n**Channel:** ${channel}`;
}

export function formatMessage(msg: {
  ts?: string;
  text?: string;
  user?: string;
  bot_id?: string;
  username?: string;
  thread_ts?: string;
  reply_count?: number;
}): string {
  const who = msg.username ?? msg.user ?? msg.bot_id ?? "unknown";
  const when = msg.ts ? ` (${formatTs(msg.ts)})` : "";
  const thread = msg.reply_count ? ` [${msg.reply_count} replies]` : "";
  const text = msg.text ? decodeSlackText(msg.text) : "*(no text)*";
  return `**${who}**${when}${thread}\n${text}`;
}
