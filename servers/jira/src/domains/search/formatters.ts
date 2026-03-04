import type { JiraIssue } from "../../types.js";

export function formatSearchResults(
  issues: JiraIssue[],
  total: number,
  baseUrl: string,
): string {
  if (issues.length === 0) return "No issues found.";

  const lines = [`Found ${total} issue(s) (showing ${issues.length}):`, ""];
  for (const issue of issues) {
    const f = issue.fields;
    const status = f.status?.name ?? "";
    const assignee = f.assignee?.displayName ?? "Unassigned";
    const priority = f.priority?.name ?? "";
    const type = f.issuetype?.name ?? "";
    lines.push(
      `- **${issue.key}**: ${f.summary} [${type} · ${status} · ${priority}] — ${assignee} — ${baseUrl}/browse/${issue.key}`,
    );
  }
  return lines.join("\n");
}
