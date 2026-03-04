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

const CreateProjectInput = z.object({
  key: z.string().min(1).max(10),
  name: z.string().min(1),
  projectTypeKey: z.enum(["software", "business", "service_desk"]).optional().default("software"),
  projectTemplateKey: z.string().optional(),
  description: z.string().optional(),
  leadAccountId: z.string().optional(),
});

const UpdateProjectInput = z.object({
  projectIdOrKey: z.string().min(1),
  name: z.string().optional(),
  description: z.string().optional(),
  leadAccountId: z.string().optional(),
});

const DeleteProjectInput = z.object({
  projectIdOrKey: z.string().min(1),
  enableUndo: z.boolean().optional().default(true),
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

export async function handleCreateProject(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { key, name, projectTypeKey, projectTemplateKey, description, leadAccountId } =
    CreateProjectInput.parse(args);
  const body: Record<string, string> = { key, name, projectTypeKey };
  if (projectTemplateKey) body.projectTemplateKey = projectTemplateKey;
  if (description) body.description = description;
  if (leadAccountId) body.leadAccountId = leadAccountId;
  const project = await client.createProject(body as any);
  return { content: [{ type: "text", text: `Project created:\n\n${formatProject(project, baseUrl)}` }] };
}

export async function handleUpdateProject(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { projectIdOrKey, ...updates } = UpdateProjectInput.parse(args);
  const project = await client.updateProject(projectIdOrKey, updates);
  return { content: [{ type: "text", text: `Project updated:\n\n${formatProject(project, baseUrl)}` }] };
}

export async function handleDeleteProject(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { projectIdOrKey, enableUndo } = DeleteProjectInput.parse(args);
  await client.deleteProject(projectIdOrKey, enableUndo);
  return { content: [{ type: "text", text: `Project ${projectIdOrKey} deleted.` }] };
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
