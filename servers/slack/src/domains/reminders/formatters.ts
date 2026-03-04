import { formatUnix } from "../../utils/format.js";
import type { Reminder } from "../../types.js";

export function formatReminder(r: Reminder): string {
  const lines: string[] = [];
  lines.push(`**${r.text}**  ID: \`${r.id}\``);
  if (r.time) lines.push(`Scheduled: ${formatUnix(r.time)}`);
  lines.push(`Recurring: ${r.recurring ? "yes" : "no"}`);
  lines.push(`For user: \`${r.user}\``);
  if (r.complete_ts) lines.push(`Completed: ${formatUnix(r.complete_ts)}`);
  return lines.join("\n");
}

export function formatReminderList(reminders: Reminder[]): string {
  if (reminders.length === 0) return "No reminders found.";
  const lines = [`${reminders.length} reminder(s):\n`];
  for (const r of reminders) {
    const when = r.time ? ` — ${formatUnix(r.time)}` : "";
    const done = r.complete_ts ? " [done]" : "";
    lines.push(`- **${r.text}**${when}${done} \`${r.id}\``);
  }
  return lines.join("\n");
}
