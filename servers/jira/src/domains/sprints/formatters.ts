import type { JiraSprint } from "../../types.js";

export function formatSprint(sprint: JiraSprint): string {
  const lines = [
    `# ${sprint.name}`,
    "",
    `**ID:** ${sprint.id}  |  **State:** ${sprint.state}`,
  ];
  if (sprint.startDate) lines.push(`**Start:** ${sprint.startDate}`);
  if (sprint.endDate) lines.push(`**End:** ${sprint.endDate}`);
  if (sprint.completeDate) lines.push(`**Completed:** ${sprint.completeDate}`);
  if (sprint.goal) lines.push(`**Goal:** ${sprint.goal}`);
  return lines.join("\n");
}

export function formatSprintList(sprints: JiraSprint[]): string {
  if (sprints.length === 0) return "No sprints found.";

  const lines = [`Found ${sprints.length} sprint(s):`, ""];
  for (const s of sprints) {
    const dates =
      s.startDate && s.endDate ? ` (${s.startDate} → ${s.endDate})` : "";
    lines.push(`- **${s.name}** (ID: \`${s.id}\`, ${s.state})${dates}`);
  }
  return lines.join("\n");
}
