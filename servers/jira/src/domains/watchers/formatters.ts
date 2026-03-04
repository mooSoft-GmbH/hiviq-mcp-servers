import type { JiraWatchers } from "../../types.js";

export function formatWatchers(watchers: JiraWatchers): string {
  const lines = [
    `**Watch count:** ${watchers.watchCount}  |  **You are watching:** ${watchers.isWatching ? "Yes" : "No"}`,
    "",
  ];

  if (watchers.watchers.length > 0) {
    lines.push("Watchers:");
    for (const u of watchers.watchers) {
      lines.push(`- **${u.displayName}** (\`${u.accountId}\`)`);
    }
  } else {
    lines.push("No watchers.");
  }

  return lines.join("\n");
}
