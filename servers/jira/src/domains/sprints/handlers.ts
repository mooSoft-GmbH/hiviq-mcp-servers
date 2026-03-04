import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { formatIssueList } from "../issues/formatters.js";
import { formatSprint, formatSprintList } from "./formatters.js";

const ListSprintsInput = z.object({
  boardId: z.number().int(),
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
  state: z.enum(["active", "future", "closed"]).optional(),
});

const GetSprintInput = z.object({ sprintId: z.number().int() });

const CreateSprintInput = z.object({
  name: z.string().min(1),
  originBoardId: z.number().int(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goal: z.string().optional(),
});

const UpdateSprintInput = z.object({
  sprintId: z.number().int(),
  name: z.string().optional(),
  state: z.enum(["active", "closed"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goal: z.string().optional(),
});

const GetSprintIssuesInput = z.object({
  sprintId: z.number().int(),
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).optional(),
  fields: z.string().optional(),
});

const MoveIssuesToSprintInput = z.object({
  sprintId: z.number().int(),
  issueKeys: z.array(z.string()).min(1),
});

export async function handleListSprints(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { boardId, startAt, maxResults, state } = ListSprintsInput.parse(args);
  const result = await client.listSprints(boardId, { startAt, maxResults, state });
  return { content: [{ type: "text", text: formatSprintList(result.values) }] };
}

export async function handleGetSprint(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { sprintId } = GetSprintInput.parse(args);
  const sprint = await client.getSprint(sprintId);
  return { content: [{ type: "text", text: formatSprint(sprint) }] };
}

export async function handleCreateSprint(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const input = CreateSprintInput.parse(args);
  const sprint = await client.createSprint(input);
  return {
    content: [{ type: "text", text: `Sprint created:\n\n${formatSprint(sprint)}` }],
  };
}

export async function handleUpdateSprint(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { sprintId, ...updates } = UpdateSprintInput.parse(args);
  const sprint = await client.updateSprint(sprintId, updates);
  return {
    content: [{ type: "text", text: `Sprint updated:\n\n${formatSprint(sprint)}` }],
  };
}

export async function handleGetSprintIssues(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { sprintId, startAt, maxResults, fields } = GetSprintIssuesInput.parse(args);
  const result = await client.getSprintIssues(sprintId, { startAt, maxResults, fields });
  return {
    content: [{ type: "text", text: formatIssueList(result.values, baseUrl) }],
  };
}

export async function handleMoveIssuesToSprint(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { sprintId, issueKeys } = MoveIssuesToSprintInput.parse(args);
  await client.moveIssuesToSprint(sprintId, issueKeys);
  return {
    content: [
      {
        type: "text",
        text: `Moved ${issueKeys.length} issue(s) to sprint ${sprintId}: ${issueKeys.join(", ")}`,
      },
    ],
  };
}
