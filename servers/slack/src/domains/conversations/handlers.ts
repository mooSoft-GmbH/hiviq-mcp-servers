import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { Conversation, Message, ToolResult } from "../../types.js";
import { formatConversation, formatConversationList, formatMessageList } from "./formatters.js";

const ChannelInput = z.object({ channel: z.string().min(1) });

export async function handleListConversations(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { types, limit, cursor, exclude_archived } = z.object({
    types: z.string().optional().default("public_channel"),
    limit: z.number().int().min(1).max(999).optional().default(100),
    cursor: z.string().optional(),
    exclude_archived: z.boolean().optional().default(true),
  }).parse(args);
  const res = await client.listConversations({ types, limit, cursor, exclude_archived });
  return { content: [{ type: "text", text: formatConversationList(res.channels as Conversation[]) }] };
}

export async function handleGetConversationInfo(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel } = ChannelInput.parse(args);
  const res = await client.getConversationInfo({ channel });
  return { content: [{ type: "text", text: formatConversation(res.channel as Conversation) }] };
}

export async function handleGetConversationHistory(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    channel: z.string().min(1),
    limit: z.number().int().min(1).max(999).optional().default(20),
    oldest: z.string().optional(),
    latest: z.string().optional(),
    inclusive: z.boolean().optional(),
  }).parse(args);
  const res = await client.getConversationHistory(params);
  return { content: [{ type: "text", text: formatMessageList(res.messages as Message[], params.channel) }] };
}

export async function handleGetConversationReplies(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    channel: z.string().min(1),
    ts: z.string().min(1),
    limit: z.number().int().min(1).max(999).optional().default(20),
  }).parse(args);
  const res = await client.getConversationReplies(params);
  const msgs = res.messages as Message[];
  const thread = msgs.slice(1); // first message is the parent
  return { content: [{ type: "text", text: formatMessageList(thread, params.channel) }] };
}

export async function handleCreateConversation(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    name: z.string().min(1),
    is_private: z.boolean().optional().default(false),
  }).parse(args);
  const res = await client.createConversation(params);
  return { content: [{ type: "text", text: `Channel created!\n\n${formatConversation(res.channel as Conversation)}` }] };
}

export async function handleArchiveConversation(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel } = ChannelInput.parse(args);
  await client.archiveConversation({ channel });
  return { content: [{ type: "text", text: `Channel \`${channel}\` archived.` }] };
}

export async function handleJoinConversation(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel } = ChannelInput.parse(args);
  const res = await client.joinConversation({ channel });
  return { content: [{ type: "text", text: `Joined channel!\n\n${formatConversation(res.channel as Conversation)}` }] };
}

export async function handleLeaveConversation(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel } = ChannelInput.parse(args);
  await client.leaveConversation({ channel });
  return { content: [{ type: "text", text: `Left channel \`${channel}\`.` }] };
}

export async function handleRenameConversation(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({ channel: z.string().min(1), name: z.string().min(1) }).parse(args);
  const res = await client.renameConversation(params);
  return { content: [{ type: "text", text: `Channel renamed.\n\n${formatConversation(res.channel as Conversation)}` }] };
}

export async function handleInviteToConversation(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({ channel: z.string().min(1), users: z.string().min(1) }).parse(args);
  const res = await client.inviteToConversation(params);
  return { content: [{ type: "text", text: `Users invited.\n\n${formatConversation(res.channel as Conversation)}` }] };
}

export async function handleKickFromConversation(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({ channel: z.string().min(1), user: z.string().min(1) }).parse(args);
  await client.kickFromConversation(params);
  return { content: [{ type: "text", text: `User \`${params.user}\` removed from \`${params.channel}\`.` }] };
}

export async function handleOpenDirectMessage(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { users } = z.object({ users: z.string().min(1) }).parse(args);
  const res = await client.openDirectMessage({ users, return_im: true });
  return { content: [{ type: "text", text: `DM channel opened.\n\n${formatConversation(res.channel as Conversation)}` }] };
}

export async function handleSetConversationTopic(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({ channel: z.string().min(1), topic: z.string() }).parse(args);
  const res = await client.setConversationTopic(params);
  return { content: [{ type: "text", text: `Topic set to: "${res.topic}"` }] };
}

export async function handleSetConversationPurpose(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({ channel: z.string().min(1), purpose: z.string() }).parse(args);
  const res = await client.setConversationPurpose(params);
  return { content: [{ type: "text", text: `Purpose set to: "${res.purpose}"` }] };
}
