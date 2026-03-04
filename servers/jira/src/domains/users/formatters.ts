import type { JiraUser } from "../../types.js";

export function formatUser(user: JiraUser): string {
  const lines = [
    `# ${user.displayName}`,
    "",
    `**Account ID:** \`${user.accountId}\``,
    `**Active:** ${user.active ? "Yes" : "No"}`,
  ];

  if (user.emailAddress) {
    lines.push(`**Email:** ${user.emailAddress}`);
  }

  if (user.accountType) {
    lines.push(`**Account Type:** ${user.accountType}`);
  }

  return lines.join("\n");
}

export function formatUserList(users: JiraUser[]): string {
  if (users.length === 0) return "No users found.";

  const lines = [`Found ${users.length} user(s):`, ""];
  for (const u of users) {
    const email = u.emailAddress ? ` — ${u.emailAddress}` : "";
    const active = u.active ? "" : " [inactive]";
    lines.push(`- **${u.displayName}** (\`${u.accountId}\`)${email}${active}`);
  }
  return lines.join("\n");
}
