import { adfToMarkdown } from "../../utils/adf.js";
import type { JiraWorklog } from "../../types.js";

export function formatWorklog(worklog: JiraWorklog): string {
  const author = worklog.author?.displayName ?? "Unknown";
  const comment = worklog.comment ? adfToMarkdown(worklog.comment) : "";
  const lines = [
    `**${author}** — ${worklog.timeSpent} (${worklog.started}) — ID: \`${worklog.id}\``,
  ];
  if (comment) lines.push(comment);
  return lines.join("\n");
}

export function formatWorklogList(worklogs: JiraWorklog[], total: number): string {
  if (worklogs.length === 0) return "No worklogs found.";

  const lines = [`Showing ${worklogs.length} of ${total} worklog(s):`, ""];
  for (const wl of worklogs) {
    lines.push(formatWorklog(wl));
    lines.push("");
  }
  return lines.join("\n");
}
