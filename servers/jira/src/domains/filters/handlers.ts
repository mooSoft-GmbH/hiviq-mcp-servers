import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import {
  formatDashboard,
  formatDashboardList,
  formatFieldList,
  formatFilter,
  formatFilterList,
  formatLabels,
  formatPriorities,
  formatResolutions,
  formatServerInfo,
  formatStatuses,
} from "./formatters.js";

const GetFilterInput = z.object({ filterId: z.string().min(1) });

const CreateFilterInput = z.object({
  name: z.string().min(1),
  jql: z.string().min(1),
  description: z.string().optional(),
  favourite: z.boolean().optional(),
});

const UpdateFilterInput = z.object({
  filterId: z.string().min(1),
  name: z.string().optional(),
  jql: z.string().optional(),
  description: z.string().optional(),
  favourite: z.boolean().optional(),
});

const DeleteFilterInput = z.object({ filterId: z.string().min(1) });

const ListDashboardsInput = z.object({
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).optional(),
  filter: z.enum(["my", "favourite"]).optional(),
});

const GetDashboardInput = z.object({ dashboardId: z.string().min(1) });

const SearchFieldsInput = z.object({
  query: z.string().optional(),
  type: z.enum(["custom", "system"]).optional(),
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).optional(),
});

const GetAllLabelsInput = z.object({
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).optional().default(1000),
});

export async function handleListMyFilters(
  client: JiraClient,
  _baseUrl: string,
  _args: unknown,
): Promise<ToolResult> {
  const filters = await client.listMyFilters();
  return { content: [{ type: "text", text: formatFilterList(filters) }] };
}

export async function handleGetFilter(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { filterId } = GetFilterInput.parse(args);
  const filter = await client.getFilter(filterId);
  return { content: [{ type: "text", text: formatFilter(filter) }] };
}

export async function handleCreateFilter(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const input = CreateFilterInput.parse(args);
  const filter = await client.createFilter(input);
  return { content: [{ type: "text", text: `Filter created:\n\n${formatFilter(filter)}` }] };
}

export async function handleUpdateFilter(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { filterId, ...updates } = UpdateFilterInput.parse(args);
  const filter = await client.updateFilter(filterId, updates);
  return { content: [{ type: "text", text: `Filter updated:\n\n${formatFilter(filter)}` }] };
}

export async function handleDeleteFilter(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { filterId } = DeleteFilterInput.parse(args);
  await client.deleteFilter(filterId);
  return { content: [{ type: "text", text: `Filter ${filterId} deleted.` }] };
}

export async function handleListDashboards(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const params = ListDashboardsInput.parse(args);
  const result = await client.listDashboards(params);
  return {
    content: [{ type: "text", text: formatDashboardList(result.values, result.total) }],
  };
}

export async function handleGetDashboard(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { dashboardId } = GetDashboardInput.parse(args);
  const dashboard = await client.getDashboard(dashboardId);
  return { content: [{ type: "text", text: formatDashboard(dashboard) }] };
}

export async function handleListFields(
  client: JiraClient,
  _baseUrl: string,
  _args: unknown,
): Promise<ToolResult> {
  const fields = await client.listFields();
  return { content: [{ type: "text", text: formatFieldList(fields) }] };
}

export async function handleSearchFields(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const params = SearchFieldsInput.parse(args);
  const result = await client.searchFields(params);
  return { content: [{ type: "text", text: formatFieldList(result.values) }] };
}

export async function handleGetAllLabels(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { startAt, maxResults } = GetAllLabelsInput.parse(args);
  const result = await client.getAllLabels({ startAt, maxResults });
  return { content: [{ type: "text", text: formatLabels(result.values, result.total) }] };
}

export async function handleListPriorities(
  client: JiraClient,
  _baseUrl: string,
  _args: unknown,
): Promise<ToolResult> {
  const priorities = await client.listPriorities();
  return { content: [{ type: "text", text: formatPriorities(priorities) }] };
}

export async function handleListResolutions(
  client: JiraClient,
  _baseUrl: string,
  _args: unknown,
): Promise<ToolResult> {
  const resolutions = await client.listResolutions();
  return { content: [{ type: "text", text: formatResolutions(resolutions) }] };
}

export async function handleListStatuses(
  client: JiraClient,
  _baseUrl: string,
  _args: unknown,
): Promise<ToolResult> {
  const statuses = await client.listStatuses();
  return { content: [{ type: "text", text: formatStatuses(statuses) }] };
}

export async function handleGetServerInfo(
  client: JiraClient,
  _baseUrl: string,
  _args: unknown,
): Promise<ToolResult> {
  const info = await client.getServerInfo();
  return { content: [{ type: "text", text: formatServerInfo(info) }] };
}
