import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import type { SlackUser, UserProfile } from "../../types.js";
import { formatUser, formatUserList, formatPresence, formatUserProfile } from "./formatters.js";

export async function handleListUsers(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    limit: z.number().int().min(1).max(999).optional().default(100),
    cursor: z.string().optional(),
  }).parse(args);
  const res = await client.listUsers(params);
  return { content: [{ type: "text", text: formatUserList(res.members as SlackUser[]) }] };
}

export async function handleGetUserInfo(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { user } = z.object({ user: z.string().min(1) }).parse(args);
  const res = await client.getUserInfo({ user });
  return { content: [{ type: "text", text: formatUser(res.user as SlackUser) }] };
}

export async function handleGetUserPresence(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { user } = z.object({ user: z.string().min(1) }).parse(args);
  const res = await client.getUserPresence({ user });
  return {
    content: [{
      type: "text",
      text: formatPresence(user, res.presence as string, res.online as boolean | undefined, res.auto_away as boolean | undefined),
    }],
  };
}

export async function handleGetUserProfile(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    user: z.string().min(1),
    include_labels: z.boolean().optional(),
  }).parse(args);
  const res = await client.getUserProfile(params);
  return { content: [{ type: "text", text: formatUserProfile(params.user, res.profile as UserProfile & Record<string, unknown>) }] };
}

export async function handleLookupUserByEmail(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { email } = z.object({ email: z.string().email() }).parse(args);
  const res = await client.lookupUserByEmail({ email });
  return { content: [{ type: "text", text: formatUser(res.user as SlackUser) }] };
}

export async function handleSetUserPresence(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { presence } = z.object({ presence: z.enum(["auto", "away"]) }).parse(args);
  await client.setUserPresence({ presence });
  return { content: [{ type: "text", text: `Presence set to **${presence}**.` }] };
}
