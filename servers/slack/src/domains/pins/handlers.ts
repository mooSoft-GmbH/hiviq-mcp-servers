import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import type { PinItem } from "../../types.js";
import { formatPinList } from "./formatters.js";

const ChannelTsInput = z.object({
  channel: z.string().min(1),
  timestamp: z.string().min(1),
});

export async function handleListPins(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel } = z.object({ channel: z.string().min(1) }).parse(args);
  const res = await client.listPins({ channel });
  return { content: [{ type: "text", text: formatPinList(res.items as PinItem[], channel) }] };
}

export async function handleAddPin(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel, timestamp } = ChannelTsInput.parse(args);
  await client.addPin({ channel, timestamp });
  return { content: [{ type: "text", text: `Message \`${timestamp}\` pinned in \`${channel}\`.` }] };
}

export async function handleRemovePin(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel, timestamp } = ChannelTsInput.parse(args);
  await client.removePin({ channel, timestamp });
  return { content: [{ type: "text", text: `Message \`${timestamp}\` unpinned from \`${channel}\`.` }] };
}
