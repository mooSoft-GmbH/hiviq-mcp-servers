import type { Team } from "../../types.js";

export function formatTeam(team: Team): string {
  const lines: string[] = [];
  lines.push(`**${team.name}**  ID: \`${team.id}\``);
  lines.push(`Domain: ${team.domain}.slack.com`);
  if (team.email_domain) lines.push(`Email domain: ${team.email_domain}`);
  if (team.enterprise_id) lines.push(`Enterprise: ${team.enterprise_name ?? team.enterprise_id} (\`${team.enterprise_id}\`)`);
  return lines.join("\n");
}
