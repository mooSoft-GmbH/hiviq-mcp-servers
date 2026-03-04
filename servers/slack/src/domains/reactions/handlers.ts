import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import type { Reaction, Message } from "../../types.js";
import { formatReactions } from "./formatters.js";

const ReactionInput = z.object({
  channel: z.string().min(1),
  timestamp: z.string().min(1),
  name: z.string().min(1),
});

export async function handleAddReaction(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel, timestamp, name } = ReactionInput.parse(args);
  await client.addReaction({ channel, timestamp, name });
  return { content: [{ type: "text", text: `Reaction :${name}: added to message \`${timestamp}\`.` }] };
}

export async function handleRemoveReaction(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel, timestamp, name } = ReactionInput.parse(args);
  await client.removeReaction({ channel, timestamp, name });
  return { content: [{ type: "text", text: `Reaction :${name}: removed from message \`${timestamp}\`.` }] };
}

export async function handleGetReactions(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    channel: z.string().min(1),
    timestamp: z.string().min(1),
    full: z.boolean().optional(),
  }).parse(args);
  const res = await client.getReactions(params);
  const message = res.message as Message;
  const reactions = message.reactions ?? [];
  return { content: [{ type: "text", text: formatReactions(reactions as Reaction[], params.channel, params.timestamp) }] };
}
