import { adfToMarkdown } from "../../utils/adf.js";
import type {
  JiraChangelog,
  JiraIssue,
  JiraIssueType,
  JiraTransition,
} from "../../types.js";

export function formatIssue(issue: JiraIssue, baseUrl: string): string {
  const f = issue.fields;
  const lines: string[] = [
    `# ${issue.key}: ${f.summary}`,
    "",
    `**Status:** ${f.status?.name ?? "Unknown"}  |  **Type:** ${f.issuetype?.name ?? "Unknown"}  |  **Priority:** ${f.priority?.name ?? "None"}`,
  ];

  if (f.assignee) {
    lines.push(`**Assignee:** ${f.assignee.displayName} (\`${f.assignee.accountId}\`)`);
  } else {
    lines.push("**Assignee:** Unassigned");
  }

  if (f.reporter) {
    lines.push(`**Reporter:** ${f.reporter.displayName}`);
  }

  if (f.project) {
    lines.push(`**Project:** ${f.project.name} (\`${f.project.key}\`)`);
  }

  if (f.resolution) {
    lines.push(`**Resolution:** ${f.resolution.name}`);
  }

  if (f.labels && f.labels.length > 0) {
    lines.push(`**Labels:** ${f.labels.join(", ")}`);
  }

  if (f.components && f.components.length > 0) {
    lines.push(`**Components:** ${f.components.map((c) => c.name).join(", ")}`);
  }

  if (f.fixVersions && f.fixVersions.length > 0) {
    lines.push(`**Fix Versions:** ${f.fixVersions.map((v) => v.name).join(", ")}`);
  }

  if (f.parent) {
    lines.push(`**Parent:** ${f.parent.key}${f.parent.fields?.summary ? ` — ${f.parent.fields.summary}` : ""}`);
  }

  if (f.created) lines.push(`**Created:** ${f.created}`);
  if (f.updated) lines.push(`**Updated:** ${f.updated}`);
  if (f.duedate) lines.push(`**Due:** ${f.duedate}`);

  lines.push(`**URL:** ${baseUrl}/browse/${issue.key}`);

  if (f.description) {
    lines.push("", "---", "", adfToMarkdown(f.description));
  }

  if (f.subtasks && f.subtasks.length > 0) {
    lines.push("", "## Sub-tasks");
    for (const st of f.subtasks) {
      const status = st.fields?.status?.name ?? "";
      lines.push(`- **${st.key}**: ${st.fields?.summary ?? ""} [${status}]`);
    }
  }

  if (f.issuelinks && f.issuelinks.length > 0) {
    lines.push("", "## Links");
    for (const link of f.issuelinks) {
      if (link.outwardIssue) {
        lines.push(
          `- ${link.type.outward} **${link.outwardIssue.key}**: ${link.outwardIssue.fields?.summary ?? ""}`,
        );
      }
      if (link.inwardIssue) {
        lines.push(
          `- ${link.type.inward} **${link.inwardIssue.key}**: ${link.inwardIssue.fields?.summary ?? ""}`,
        );
      }
    }
  }

  return lines.join("\n");
}

export function formatIssueList(issues: JiraIssue[], baseUrl: string, total?: number): string {
  if (issues.length === 0) return "No issues found.";

  const header = total !== undefined
    ? `Found ${total} issue(s) (showing ${issues.length}):\n`
    : `Found ${issues.length} issue(s):\n`;

  const rows = issues.map((issue) => {
    const f = issue.fields;
    const status = f.status?.name ?? "";
    const assignee = f.assignee?.displayName ?? "Unassigned";
    const priority = f.priority?.name ?? "";
    return `- **${issue.key}**: ${f.summary} [${status}] — ${assignee} (${priority})`;
  });

  return header + rows.join("\n");
}

export function formatTransitions(transitions: JiraTransition[]): string {
  if (transitions.length === 0) return "No transitions available.";

  const lines = ["Available transitions:", ""];
  for (const t of transitions) {
    lines.push(`- **${t.name}** (ID: \`${t.id}\`) → ${t.to.name}`);
  }
  return lines.join("\n");
}

export function formatIssueTypes(types: JiraIssueType[]): string {
  if (types.length === 0) return "No issue types found.";

  const lines = [`Found ${types.length} issue type(s):`, ""];
  for (const t of types) {
    const sub = t.subtask ? " (subtask)" : "";
    lines.push(`- **${t.name}**${sub} — ID: \`${t.id}\`${t.description ? ` — ${t.description}` : ""}`);
  }
  return lines.join("\n");
}

export function formatChangelogs(changelogs: JiraChangelog[], total: number): string {
  if (changelogs.length === 0) return "No changelog entries found.";

  const lines = [`Showing ${changelogs.length} of ${total} changelog entries:`, ""];
  for (const entry of changelogs) {
    const author = entry.author?.displayName ?? "Unknown";
    lines.push(`### ${entry.created} — ${author}`);
    for (const item of entry.items) {
      lines.push(`- **${item.field}**: ${item.fromString ?? "(none)"} → ${item.toString ?? "(none)"}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
