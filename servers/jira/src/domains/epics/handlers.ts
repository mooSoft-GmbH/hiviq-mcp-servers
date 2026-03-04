import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { formatIssueList } from "../issues/formatters.js";
import { formatEpic, formatVotes } from "./formatters.js";

const GetEpicInput = z.object({ epicIdOrKey: z.string().min(1) });

const GetEpicIssuesInput = z.object({
  epicIdOrKey: z.string().min(1),
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).optional(),
  fields: z.string().optional(),
});

const MoveIssuesToEpicInput = z.object({
  epicIdOrKey: z.string().min(1),
  issueKeys: z.array(z.string()).min(1),
});

const MoveIssuesToBacklogInput = z.object({
  issueKeys: z.array(z.string()).min(1),
});

const IssueIdOrKeyInput = z.object({ issueIdOrKey: z.string().min(1) });

export async function handleGetEpic(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { epicIdOrKey } = GetEpicInput.parse(args);
  const epic = await client.getEpic(epicIdOrKey);
  return { content: [{ type: "text", text: formatEpic(epic) }] };
}

export async function handleGetEpicIssues(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { epicIdOrKey, startAt, maxResults, fields } = GetEpicIssuesInput.parse(args);
  const result = await client.getEpicIssues(epicIdOrKey, { startAt, maxResults, fields });
  return {
    content: [{ type: "text", text: formatIssueList(result.values, baseUrl) }],
  };
}

export async function handleMoveIssuesToEpic(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { epicIdOrKey, issueKeys } = MoveIssuesToEpicInput.parse(args);
  await client.moveIssuesToEpic(epicIdOrKey, issueKeys);
  return {
    content: [
      {
        type: "text",
        text: `Moved ${issueKeys.length} issue(s) to epic ${epicIdOrKey}: ${issueKeys.join(", ")}`,
      },
    ],
  };
}

export async function handleMoveIssuesToBacklog(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueKeys } = MoveIssuesToBacklogInput.parse(args);
  await client.moveIssuesToBacklog(issueKeys);
  return {
    content: [
      {
        type: "text",
        text: `Moved ${issueKeys.length} issue(s) to backlog: ${issueKeys.join(", ")}`,
      },
    ],
  };
}

export async function handleGetVotes(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey } = IssueIdOrKeyInput.parse(args);
  const votes = await client.getVotes(issueIdOrKey);
  return { content: [{ type: "text", text: formatVotes(votes) }] };
}

export async function handleAddVote(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey } = IssueIdOrKeyInput.parse(args);
  await client.addVote(issueIdOrKey);
  return { content: [{ type: "text", text: `Vote added to ${issueIdOrKey}.` }] };
}

export async function handleRemoveVote(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey } = IssueIdOrKeyInput.parse(args);
  await client.removeVote(issueIdOrKey);
  return { content: [{ type: "text", text: `Vote removed from ${issueIdOrKey}.` }] };
}
