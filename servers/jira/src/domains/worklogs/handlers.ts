import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { textToAdf } from "../../utils/adf.js";
import { formatWorklog, formatWorklogList } from "./formatters.js";

const ListWorklogsInput = z.object({
  issueIdOrKey: z.string().min(1),
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).optional(),
});

const AddWorklogInput = z.object({
  issueIdOrKey: z.string().min(1),
  timeSpent: z.string().min(1),
  started: z.string().optional(),
  comment: z.string().optional(),
});

const UpdateWorklogInput = z.object({
  issueIdOrKey: z.string().min(1),
  worklogId: z.string().min(1),
  timeSpent: z.string().optional(),
  started: z.string().optional(),
  comment: z.string().optional(),
});

const DeleteWorklogInput = z.object({
  issueIdOrKey: z.string().min(1),
  worklogId: z.string().min(1),
});

export async function handleListWorklogs(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, startAt, maxResults } = ListWorklogsInput.parse(args);
  const result = await client.listWorklogs(issueIdOrKey, { startAt, maxResults });
  return {
    content: [{ type: "text", text: formatWorklogList(result.worklogs, result.total) }],
  };
}

export async function handleAddWorklog(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, timeSpent, started, comment } = AddWorklogInput.parse(args);
  const worklog = await client.addWorklog(issueIdOrKey, {
    timeSpent,
    started,
    comment: comment ? textToAdf(comment) : undefined,
  });
  return {
    content: [
      { type: "text", text: `Worklog added to ${issueIdOrKey}:\n\n${formatWorklog(worklog)}` },
    ],
  };
}

export async function handleUpdateWorklog(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, worklogId, timeSpent, started, comment } = UpdateWorklogInput.parse(args);
  const worklog = await client.updateWorklog(issueIdOrKey, worklogId, {
    timeSpent,
    started,
    comment: comment ? textToAdf(comment) : undefined,
  });
  return {
    content: [{ type: "text", text: `Worklog ${worklogId} updated:\n\n${formatWorklog(worklog)}` }],
  };
}

export async function handleDeleteWorklog(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, worklogId } = DeleteWorklogInput.parse(args);
  await client.deleteWorklog(issueIdOrKey, worklogId);
  return {
    content: [{ type: "text", text: `Worklog ${worklogId} deleted from ${issueIdOrKey}.` }],
  };
}
