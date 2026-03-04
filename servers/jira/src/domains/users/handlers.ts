import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { formatUser, formatUserList } from "./formatters.js";

const GetUserInput = z.object({
  accountId: z.string().min(1),
});

const SearchUsersInput = z.object({
  query: z.string().min(1),
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
});

const FindUsersAssignableInput = z.object({
  project: z.string().optional(),
  issueKey: z.string().optional(),
  query: z.string().optional(),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
});

export async function handleGetMyself(
  client: JiraClient,
  _baseUrl: string,
  _args: unknown,
): Promise<ToolResult> {
  const user = await client.getMyself();
  return { content: [{ type: "text", text: formatUser(user) }] };
}

export async function handleGetUser(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { accountId } = GetUserInput.parse(args);
  const user = await client.getUser(accountId);
  return { content: [{ type: "text", text: formatUser(user) }] };
}

export async function handleSearchUsers(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { query, startAt, maxResults } = SearchUsersInput.parse(args);
  const users = await client.searchUsers({ query, startAt, maxResults });
  return { content: [{ type: "text", text: formatUserList(users) }] };
}

export async function handleFindUsersAssignable(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { project, issueKey, query, maxResults } = FindUsersAssignableInput.parse(args);
  const users = await client.findUsersAssignable({ project, issueKey, query, maxResults });
  return { content: [{ type: "text", text: formatUserList(users) }] };
}
