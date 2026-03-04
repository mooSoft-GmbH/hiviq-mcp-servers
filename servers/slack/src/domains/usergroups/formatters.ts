import { formatUnix } from "../../utils/format.js";
import type { UserGroup } from "../../types.js";

export function formatUsergroup(g: UserGroup): string {
  const lines: string[] = [];
  lines.push(`**${g.name}** (@${g.handle})  ID: \`${g.id}\``);
  if (g.description) lines.push(`Description: ${g.description}`);
  if (g.user_count !== undefined) lines.push(`Members: ${g.user_count}`);
  if (g.is_external) lines.push(`External: yes`);
  if (g.date_create) lines.push(`Created: ${formatUnix(g.date_create)}`);
  if (g.users?.length) lines.push(`User IDs: ${g.users.map((u) => `\`${u}\``).join(", ")}`);
  return lines.join("\n");
}

export function formatUsergroupList(groups: UserGroup[]): string {
  if (groups.length === 0) return "No user groups found.";
  const lines = [`${groups.length} user group(s):\n`];
  for (const g of groups) {
    const count = g.user_count !== undefined ? ` (${g.user_count} members)` : "";
    lines.push(`- **${g.name}** @${g.handle}${count} \`${g.id}\``);
    if (g.description) lines.push(`  ${g.description}`);
  }
  return lines.join("\n");
}

export function formatUsergroupMembers(usergroupId: string, users: string[]): string {
  if (users.length === 0) return `No members in user group \`${usergroupId}\`.`;
  const lines = [`${users.length} member(s) in \`${usergroupId}\`:\n`];
  for (const u of users) lines.push(`- \`${u}\``);
  return lines.join("\n");
}
