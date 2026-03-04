import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import { formatPermalink, formatPostedMessage, formatScheduledMessage } from "./formatters.js";

const PostMessageInput = z.object({
  channel: z.string().min(1),
  text: z.string().optional(),
  thread_ts: z.string().optional(),
  username: z.string().optional(),
  icon_emoji: z.string().optional(),
  icon_url: z.string().optional(),
  blocks: z.array(z.unknown()).optional(),
  unfurl_links: z.boolean().optional(),
});

const UpdateMessageInput = z.object({
  channel: z.string().min(1),
  ts: z.string().min(1),
  text: z.string().optional(),
  blocks: z.array(z.unknown()).optional(),
});

const DeleteMessageInput = z.object({
  channel: z.string().min(1),
  ts: z.string().min(1),
});

const ScheduleMessageInput = z.object({
  channel: z.string().min(1),
  text: z.string().min(1),
  post_at: z.number().int().positive(),
  thread_ts: z.string().optional(),
});

const GetPermalinkInput = z.object({
  channel: z.string().min(1),
  message_ts: z.string().min(1),
});

export async function handlePostMessage(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = PostMessageInput.parse(args);
  const result = await client.postMessage(params);
  return { content: [{ type: "text", text: formatPostedMessage(result.ts, result.channel) }] };
}

export async function handleUpdateMessage(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = UpdateMessageInput.parse(args);
  const result = await client.updateMessage(params);
  return { content: [{ type: "text", text: `Message updated.\n**Channel:** ${result.channel}\n**Timestamp:** ${result.ts}` }] };
}

export async function handleDeleteMessage(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel, ts } = DeleteMessageInput.parse(args);
  await client.deleteMessage({ channel, ts });
  return { content: [{ type: "text", text: `Message \`${ts}\` deleted from ${channel}.` }] };
}

export async function handleScheduleMessage(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = ScheduleMessageInput.parse(args);
  const result = await client.scheduleMessage(params);
  return { content: [{ type: "text", text: formatScheduledMessage(result.scheduled_message_id, result.channel, result.post_at) }] };
}

export async function handleGetPermalink(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = GetPermalinkInput.parse(args);
  const result = await client.getPermalink(params);
  return { content: [{ type: "text", text: formatPermalink(result.permalink, result.channel) }] };
}
