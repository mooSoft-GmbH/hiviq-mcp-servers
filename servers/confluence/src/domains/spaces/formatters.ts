import type { Space } from "../../types.js";

export function formatSpace(space: Space, baseUrl: string): string {
  const lines: string[] = [
    `# ${space.name}`,
    `**Key:** ${space.key}  |  **ID:** ${space.id}  |  **Type:** ${space.type}  |  **Status:** ${space.status}`,
  ];

  if (space.description?.plain?.value) {
    lines.push("", space.description.plain.value);
  }

  if (space._links?.webui) {
    lines.push("", `**URL:** ${baseUrl}/wiki${space._links.webui}`);
  }

  return lines.join("\n");
}

export function formatSpaceList(spaces: Space[], baseUrl: string): string {
  if (spaces.length === 0) return "No spaces found.";

  const header = `Found ${spaces.length} space(s):\n`;
  const rows = spaces.map((s) => {
    const url = s._links?.webui ? ` — ${baseUrl}/wiki${s._links.webui}` : "";
    return `- **${s.name}** (\`${s.key}\`, ID: \`${s.id}\`, ${s.type})${url}`;
  });

  return header + rows.join("\n");
}
