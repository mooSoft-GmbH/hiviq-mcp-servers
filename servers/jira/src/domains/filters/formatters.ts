import type {
  JiraDashboard,
  JiraField,
  JiraFilter,
  JiraPriority,
  JiraResolution,
  JiraServerInfo,
  JiraStatus,
} from "../../types.js";

export function formatFilter(filter: JiraFilter): string {
  const lines = [
    `# ${filter.name}`,
    "",
    `**ID:** ${filter.id}  |  **Favourite:** ${filter.favourite ? "Yes" : "No"}`,
    `**JQL:** \`${filter.jql}\``,
  ];
  if (filter.description) lines.push(`**Description:** ${filter.description}`);
  if (filter.owner) lines.push(`**Owner:** ${filter.owner.displayName}`);
  if (filter.viewUrl) lines.push(`**URL:** ${filter.viewUrl}`);
  return lines.join("\n");
}

export function formatFilterList(filters: JiraFilter[]): string {
  if (filters.length === 0) return "No filters found.";

  const lines = [`Found ${filters.length} filter(s):`, ""];
  for (const f of filters) {
    const fav = f.favourite ? " *" : "";
    lines.push(`- **${f.name}**${fav} (ID: \`${f.id}\`) — \`${f.jql}\``);
  }
  return lines.join("\n");
}

export function formatDashboard(dashboard: JiraDashboard): string {
  const lines = [
    `# ${dashboard.name}`,
    "",
    `**ID:** ${dashboard.id}`,
  ];
  if (dashboard.description) lines.push(`**Description:** ${dashboard.description}`);
  if (dashboard.owner) lines.push(`**Owner:** ${dashboard.owner.displayName}`);
  if (dashboard.view) lines.push(`**URL:** ${dashboard.view}`);
  return lines.join("\n");
}

export function formatDashboardList(dashboards: JiraDashboard[], total: number): string {
  if (dashboards.length === 0) return "No dashboards found.";

  const lines = [`Found ${total} dashboard(s) (showing ${dashboards.length}):`, ""];
  for (const d of dashboards) {
    const owner = d.owner ? ` — ${d.owner.displayName}` : "";
    lines.push(`- **${d.name}** (ID: \`${d.id}\`)${owner}`);
  }
  return lines.join("\n");
}

export function formatFieldList(fields: JiraField[]): string {
  if (fields.length === 0) return "No fields found.";

  const lines = [`Found ${fields.length} field(s):`, ""];
  for (const f of fields) {
    const type = f.custom ? "custom" : "system";
    const searchable = f.searchable ? "searchable" : "";
    const clauses = f.clauseNames?.length ? ` — JQL: ${f.clauseNames.join(", ")}` : "";
    lines.push(`- **${f.name}** (\`${f.id}\`, ${type}${searchable ? `, ${searchable}` : ""})${clauses}`);
  }
  return lines.join("\n");
}

export function formatLabels(labels: string[], total: number): string {
  if (labels.length === 0) return "No labels found.";
  return `Found ${total} label(s) (showing ${labels.length}):\n\n${labels.map((l) => `- ${l}`).join("\n")}`;
}

export function formatPriorities(priorities: JiraPriority[]): string {
  if (priorities.length === 0) return "No priorities found.";
  const lines = [`Found ${priorities.length} priority/priorities:`, ""];
  for (const p of priorities) {
    const desc = p.description ? ` — ${p.description}` : "";
    lines.push(`- **${p.name}** (ID: \`${p.id}\`)${desc}`);
  }
  return lines.join("\n");
}

export function formatResolutions(resolutions: JiraResolution[]): string {
  if (resolutions.length === 0) return "No resolutions found.";
  const lines = [`Found ${resolutions.length} resolution(s):`, ""];
  for (const r of resolutions) {
    const desc = r.description ? ` — ${r.description}` : "";
    lines.push(`- **${r.name}** (ID: \`${r.id}\`)${desc}`);
  }
  return lines.join("\n");
}

export function formatStatuses(statuses: JiraStatus[]): string {
  if (statuses.length === 0) return "No statuses found.";
  const lines = [`Found ${statuses.length} status(es):`, ""];
  for (const s of statuses) {
    const cat = s.statusCategory ? ` [${s.statusCategory.name}]` : "";
    const desc = s.description ? ` — ${s.description}` : "";
    lines.push(`- **${s.name}**${cat} (ID: \`${s.id}\`)${desc}`);
  }
  return lines.join("\n");
}

export function formatServerInfo(info: JiraServerInfo): string {
  return [
    `# Jira Server Info`,
    "",
    `**Base URL:** ${info.baseUrl}`,
    `**Version:** ${info.version}`,
    `**Deployment:** ${info.deploymentType}`,
    `**Build:** ${info.buildNumber}`,
    info.serverTitle ? `**Title:** ${info.serverTitle}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
