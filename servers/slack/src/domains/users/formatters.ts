import { formatUnix } from "../../utils/format.js";
import type { SlackUser, UserProfile } from "../../types.js";

export function formatUser(u: SlackUser): string {
  const lines: string[] = [];
  const badge = u.is_bot ? " [bot]" : "";
  const admin = u.is_admin ? " [admin]" : "";
  const owner = u.is_owner ? " [owner]" : "";
  const deleted = u.deleted ? " [deleted]" : "";
  lines.push(`**${u.real_name ?? u.name}**${badge}${admin}${owner}${deleted}  ID: \`${u.id}\``);
  lines.push(`Username: @${u.name}`);
  if (u.profile?.email) lines.push(`Email: ${u.profile.email}`);
  if (u.profile?.title) lines.push(`Title: ${u.profile.title}`);
  if (u.profile?.phone) lines.push(`Phone: ${u.profile.phone}`);
  if (u.profile?.status_text) {
    const emoji = u.profile.status_emoji ? `${u.profile.status_emoji} ` : "";
    lines.push(`Status: ${emoji}${u.profile.status_text}`);
  }
  if (u.tz) lines.push(`Timezone: ${u.tz}`);
  return lines.join("\n");
}

export function formatUserList(users: SlackUser[]): string {
  if (users.length === 0) return "No users found.";
  const active = users.filter((u) => !u.deleted && !u.is_bot);
  const bots = users.filter((u) => !u.deleted && u.is_bot);
  const deleted = users.filter((u) => u.deleted);
  const lines = [`Found ${users.length} user(s) (${active.length} active, ${bots.length} bots, ${deleted.length} deleted):\n`];
  for (const u of users) {
    const badge = u.is_bot ? " [bot]" : "";
    const del = u.deleted ? " [deleted]" : "";
    const email = u.profile?.email ? ` <${u.profile.email}>` : "";
    lines.push(`- **${u.real_name ?? u.name}**${badge}${del} (\`${u.id}\`)${email}`);
  }
  return lines.join("\n");
}

export function formatPresence(userId: string, presence: string, online?: boolean, auto_away?: boolean): string {
  const lines = [`Presence for \`${userId}\`: **${presence}**`];
  if (online !== undefined) lines.push(`Online: ${online ? "yes" : "no"}`);
  if (auto_away !== undefined) lines.push(`Auto away: ${auto_away ? "yes" : "no"}`);
  return lines.join("\n");
}

export function formatUserProfile(userId: string, profile: UserProfile & Record<string, unknown>): string {
  const lines = [`Profile for \`${userId}\`:`];
  if (profile.real_name) lines.push(`Name: ${profile.real_name}`);
  if (profile.display_name) lines.push(`Display name: ${profile.display_name}`);
  if (profile.email) lines.push(`Email: ${profile.email}`);
  if (profile.title) lines.push(`Title: ${profile.title}`);
  if (profile.phone) lines.push(`Phone: ${profile.phone}`);
  if (profile.status_text) {
    const emoji = profile.status_emoji ? `${profile.status_emoji} ` : "";
    lines.push(`Status: ${emoji}${profile.status_text}`);
  }
  return lines.join("\n");
}
