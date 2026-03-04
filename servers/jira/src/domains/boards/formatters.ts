import type { JiraBoard, JiraBoardConfig } from "../../types.js";

export function formatBoard(board: JiraBoard): string {
  const lines = [
    `# ${board.name}`,
    "",
    `**ID:** ${board.id}  |  **Type:** ${board.type}`,
  ];
  if (board.location) {
    const loc = board.location;
    lines.push(
      `**Project:** ${loc.projectName ?? ""} (\`${loc.projectKey ?? ""}\`)`,
    );
  }
  return lines.join("\n");
}

export function formatBoardList(boards: JiraBoard[]): string {
  if (boards.length === 0) return "No boards found.";

  const lines = [`Found ${boards.length} board(s):`, ""];
  for (const b of boards) {
    const project = b.location?.projectKey ? ` — Project: ${b.location.projectKey}` : "";
    lines.push(`- **${b.name}** (ID: \`${b.id}\`, ${b.type})${project}`);
  }
  return lines.join("\n");
}

export function formatBoardConfig(config: JiraBoardConfig): string {
  const lines = [
    `# Board Configuration: ${config.name}`,
    "",
    `**ID:** ${config.id}  |  **Type:** ${config.type}`,
  ];

  if (config.columnConfig?.columns) {
    lines.push("", "## Columns");
    for (const col of config.columnConfig.columns) {
      const statuses = col.statuses.map((s) => s.id).join(", ");
      lines.push(`- **${col.name}** — statuses: [${statuses}]`);
    }
  }

  if (config.estimation) {
    lines.push("", `**Estimation:** ${config.estimation.type}`);
    if (config.estimation.field) {
      lines.push(`**Estimation Field:** ${config.estimation.field.displayName}`);
    }
  }

  return lines.join("\n");
}
