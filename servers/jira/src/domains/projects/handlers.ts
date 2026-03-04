import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { formatComponents, formatProject, formatProjectList, formatVersions } from "./formatters.js";

const ListProjectsInput = z.object({
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
  orderBy: z.string().optional(),
});

const GetProjectInput = z.object({
  projectIdOrKey: z.string().min(1),
});

const ListProjectComponentsInput = z.object({
  projectIdOrKey: z.string().min(1),
});

const ListProjectVersionsInput = z.object({
  projectIdOrKey: z.string().min(1),
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).max(100).optional(),
  orderBy: z.string().optional(),
});

export async function handleListProjects(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { startAt, maxResults, orderBy } = ListProjectsInput.parse(args);
  const result = await client.listProjects({ startAt, maxResults, orderBy });
  return {
    content: [{ type: "text", text: formatProjectList(result.values, result.total, baseUrl) }],
  };
}

export async function handleGetProject(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { projectIdOrKey } = GetProjectInput.parse(args);
  const project = await client.getProject(projectIdOrKey);
  return { content: [{ type: "text", text: formatProject(project, baseUrl) }] };
}

export async function handleListProjectComponents(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { projectIdOrKey } = ListProjectComponentsInput.parse(args);
  const components = await client.listProjectComponents(projectIdOrKey);
  return { content: [{ type: "text", text: formatComponents(components) }] };
}

export async function handleListProjectVersions(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { projectIdOrKey, startAt, maxResults, orderBy } = ListProjectVersionsInput.parse(args);
  const result = await client.listProjectVersions(projectIdOrKey, { startAt, maxResults, orderBy });
  return { content: [{ type: "text", text: formatVersions(result.values, result.total) }] };
}
