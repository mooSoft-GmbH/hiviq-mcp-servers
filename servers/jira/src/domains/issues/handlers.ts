import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { textToAdf } from "../../utils/adf.js";
import {
  formatChangelogs,
  formatIssue,
  formatIssueList,
  formatIssueTypes,
  formatTransitions,
} from "./formatters.js";

const GetIssueInput = z.object({
  issueIdOrKey: z.string().min(1),
  fields: z.string().optional(),
  expand: z.string().optional(),
});

const CreateIssueInput = z.object({
  projectKey: z.string().min(1),
  issueType: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().optional(),
  assigneeAccountId: z.string().optional(),
  priority: z.string().optional(),
  labels: z.array(z.string()).optional(),
  parentKey: z.string().optional(),
  components: z.array(z.string()).optional(),
});

const UpdateIssueInput = z.object({
  issueIdOrKey: z.string().min(1),
  summary: z.string().optional(),
  description: z.string().optional(),
  assigneeAccountId: z.string().optional(),
  priority: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

const DeleteIssueInput = z.object({
  issueIdOrKey: z.string().min(1),
});

const AssignIssueInput = z.object({
  issueIdOrKey: z.string().min(1),
  accountId: z.string().nullable(),
});

const GetTransitionsInput = z.object({
  issueIdOrKey: z.string().min(1),
});

const TransitionIssueInput = z.object({
  issueIdOrKey: z.string().min(1),
  transitionId: z.string().min(1),
});

const ListIssueTypesInput = z.object({
  projectIdOrKey: z.string().optional(),
});

const GetIssueChangelogsInput = z.object({
  issueIdOrKey: z.string().min(1),
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).max(100).optional(),
});

const BulkGetIssuesInput = z.object({
  issueIdsOrKeys: z.array(z.string()).min(1),
  fields: z.string().optional(),
});

export async function handleGetIssue(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, fields, expand } = GetIssueInput.parse(args);
  const issue = await client.getIssue(issueIdOrKey, { fields, expand });
  return { content: [{ type: "text", text: formatIssue(issue, baseUrl) }] };
}

export async function handleCreateIssue(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const input = CreateIssueInput.parse(args);
  const fields: Record<string, unknown> = {
    project: { key: input.projectKey },
    issuetype: { name: input.issueType },
    summary: input.summary,
  };

  if (input.description) fields.description = textToAdf(input.description);
  if (input.assigneeAccountId) fields.assignee = { accountId: input.assigneeAccountId };
  if (input.priority) fields.priority = { name: input.priority };
  if (input.labels) fields.labels = input.labels;
  if (input.parentKey) fields.parent = { key: input.parentKey };
  if (input.components) fields.components = input.components.map((name) => ({ name }));

  const result = await client.createIssue({ fields });
  return {
    content: [
      {
        type: "text",
        text: `Issue created: **${result.key}** (ID: ${result.id})\n**URL:** ${baseUrl}/browse/${result.key}`,
      },
    ],
  };
}

export async function handleUpdateIssue(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, ...updates } = UpdateIssueInput.parse(args);
  const fields: Record<string, unknown> = {};

  if (updates.summary !== undefined) fields.summary = updates.summary;
  if (updates.description !== undefined) fields.description = textToAdf(updates.description);
  if (updates.assigneeAccountId !== undefined) {
    fields.assignee = updates.assigneeAccountId ? { accountId: updates.assigneeAccountId } : null;
  }
  if (updates.priority !== undefined) fields.priority = { name: updates.priority };
  if (updates.labels !== undefined) fields.labels = updates.labels;

  await client.updateIssue(issueIdOrKey, { fields });
  return { content: [{ type: "text", text: `Issue ${issueIdOrKey} updated successfully.` }] };
}

export async function handleDeleteIssue(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey } = DeleteIssueInput.parse(args);
  await client.deleteIssue(issueIdOrKey);
  return { content: [{ type: "text", text: `Issue ${issueIdOrKey} deleted.` }] };
}

export async function handleAssignIssue(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, accountId } = AssignIssueInput.parse(args);
  await client.assignIssue(issueIdOrKey, accountId);
  const msg = accountId
    ? `Issue ${issueIdOrKey} assigned to \`${accountId}\`.`
    : `Issue ${issueIdOrKey} unassigned.`;
  return { content: [{ type: "text", text: msg }] };
}

export async function handleGetTransitions(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey } = GetTransitionsInput.parse(args);
  const result = await client.getTransitions(issueIdOrKey);
  return { content: [{ type: "text", text: formatTransitions(result.transitions) }] };
}

export async function handleTransitionIssue(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, transitionId } = TransitionIssueInput.parse(args);
  await client.transitionIssue(issueIdOrKey, transitionId);
  return { content: [{ type: "text", text: `Issue ${issueIdOrKey} transitioned successfully.` }] };
}

export async function handleListIssueTypes(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { projectIdOrKey } = ListIssueTypesInput.parse(args);
  const types = await client.listIssueTypes(projectIdOrKey);
  return { content: [{ type: "text", text: formatIssueTypes(types) }] };
}

export async function handleGetIssueChangelogs(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, startAt, maxResults } = GetIssueChangelogsInput.parse(args);
  const result = await client.getIssueChangelogs(issueIdOrKey, { startAt, maxResults });
  return {
    content: [{ type: "text", text: formatChangelogs(result.values, result.total) }],
  };
}

export async function handleBulkGetIssues(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdsOrKeys, fields } = BulkGetIssuesInput.parse(args);
  const result = await client.bulkGetIssues(issueIdsOrKeys, { fields });
  return {
    content: [{ type: "text", text: formatIssueList(result.issues, baseUrl, result.total) }],
  };
}
