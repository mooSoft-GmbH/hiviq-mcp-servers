import type { Reaction } from "../../types.js";

export function formatReactions(reactions: Reaction[], channel: string, ts: string): string {
  if (!reactions || reactions.length === 0) {
    return `No reactions on message \`${ts}\` in \`${channel}\`.`;
  }
  const lines = [`Reactions on message \`${ts}\` in \`${channel}\`:\n`];
  for (const r of reactions) {
    const users = r.users?.length ? ` — by: ${r.users.map((u) => `\`${u}\``).join(", ")}` : "";
    lines.push(`- :${r.name}: × ${r.count}${users}`);
  }
  return lines.join("\n");
}
