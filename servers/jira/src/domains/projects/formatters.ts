import type { JiraComponent, JiraProject, JiraVersion } from "../../types.js";

export function formatProject(project: JiraProject, baseUrl: string): string {
  const lines = [
    `# ${project.name} (\`${project.key}\`)`,
    "",
    `**ID:** ${project.id}  |  **Type:** ${project.projectTypeKey ?? "Unknown"}`,
  ];

  if (project.lead) {
    lines.push(`**Lead:** ${project.lead.displayName}`);
  }

  if (project.description) {
    lines.push(`**Description:** ${project.description}`);
  }

  lines.push(`**URL:** ${baseUrl}/browse/${project.key}`);
  return lines.join("\n");
}

export function formatProjectList(projects: JiraProject[], total: number, baseUrl: string): string {
  if (projects.length === 0) return "No projects found.";

  const lines = [`Found ${total} project(s) (showing ${projects.length}):`, ""];
  for (const p of projects) {
    const lead = p.lead ? ` — Lead: ${p.lead.displayName}` : "";
    lines.push(`- **${p.name}** (\`${p.key}\`)${lead} — ${baseUrl}/browse/${p.key}`);
  }
  return lines.join("\n");
}

export function formatComponents(components: JiraComponent[]): string {
  if (components.length === 0) return "No components found.";

  const lines = [`Found ${components.length} component(s):`, ""];
  for (const c of components) {
    const lead = c.lead ? ` — Lead: ${c.lead.displayName}` : "";
    const desc = c.description ? ` — ${c.description}` : "";
    lines.push(`- **${c.name}** (ID: \`${c.id}\`)${desc}${lead}`);
  }
  return lines.join("\n");
}

export function formatVersions(versions: JiraVersion[], total: number): string {
  if (versions.length === 0) return "No versions found.";

  const lines = [`Found ${total} version(s) (showing ${versions.length}):`, ""];
  for (const v of versions) {
    const status = v.released ? "Released" : v.archived ? "Archived" : "Unreleased";
    const date = v.releaseDate ? ` (${v.releaseDate})` : "";
    const desc = v.description ? ` — ${v.description}` : "";
    lines.push(`- **${v.name}** [${status}]${date}${desc} (ID: \`${v.id}\`)`);
  }
  return lines.join("\n");
}
