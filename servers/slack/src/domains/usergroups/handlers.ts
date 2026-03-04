import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import type { UserGroup } from "../../types.js";
import { formatUsergroup, formatUsergroupList, formatUsergroupMembers } from "./formatters.js";

export async function handleListUsergroups(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    include_disabled: z.boolean().optional(),
    include_count: z.boolean().optional(),
    include_users: z.boolean().optional(),
  }).parse(args);
  const res = await client.listUsergroups(params);
  return { content: [{ type: "text", text: formatUsergroupList(res.usergroups as UserGroup[]) }] };
}

export async function handleCreateUsergroup(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    name: z.string().min(1),
    handle: z.string().optional(),
    description: z.string().optional(),
    channels: z.string().optional(),
  }).parse(args);
  const res = await client.createUsergroup(params);
  return { content: [{ type: "text", text: `User group created!\n\n${formatUsergroup(res.usergroup as UserGroup)}` }] };
}

export async function handleUpdateUsergroup(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    usergroup: z.string().min(1),
    name: z.string().optional(),
    handle: z.string().optional(),
    description: z.string().optional(),
    channels: z.string().optional(),
  }).parse(args);
  const res = await client.updateUsergroup(params);
  return { content: [{ type: "text", text: `User group updated.\n\n${formatUsergroup(res.usergroup as UserGroup)}` }] };
}

export async function handleListUsergroupMembers(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    usergroup: z.string().min(1),
    include_disabled: z.boolean().optional(),
  }).parse(args);
  const res = await client.listUsergroupMembers(params);
  return { content: [{ type: "text", text: formatUsergroupMembers(params.usergroup, res.users as string[]) }] };
}

export async function handleUpdateUsergroupMembers(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    usergroup: z.string().min(1),
    users: z.string().min(1),
  }).parse(args);
  const res = await client.updateUsergroupMembers(params);
  const group = res.usergroup as UserGroup;
  const count = group.user_count ?? params.users.split(",").length;
  return { content: [{ type: "text", text: `User group \`${params.usergroup}\` membership updated to ${count} member(s).` }] };
}
