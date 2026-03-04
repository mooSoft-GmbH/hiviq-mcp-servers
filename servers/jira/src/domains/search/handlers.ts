import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { formatSearchResults } from "./formatters.js";

const SearchIssuesInput = z.object({
  jql: z.string().min(1),
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
  fields: z.string().optional(),
});

const SearchTextInput = z.object({
  text: z.string().min(1),
  projectKey: z.string().optional(),
  maxResults: z.number().int().min(1).max(100).optional().default(25),
});

export async function handleSearchIssues(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { jql, startAt, maxResults, fields } = SearchIssuesInput.parse(args);
  const result = await client.searchIssues({
    jql,
    startAt,
    maxResults,
    fields: fields ?? "summary,status,assignee,priority,issuetype",
  });
  return {
    content: [{ type: "text", text: formatSearchResults(result.issues, result.total, baseUrl) }],
  };
}

export async function handleSearchText(
  client: JiraClient,
  baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { text, projectKey, maxResults } = SearchTextInput.parse(args);
  const projectClause = projectKey ? `project = "${projectKey}" AND ` : "";
  const jql = `${projectClause}text ~ "${text}" ORDER BY updated DESC`;
  const result = await client.searchIssues({
    jql,
    maxResults,
    fields: "summary,status,assignee,priority,issuetype",
  });
  return {
    content: [{ type: "text", text: formatSearchResults(result.issues, result.total, baseUrl) }],
  };
}
