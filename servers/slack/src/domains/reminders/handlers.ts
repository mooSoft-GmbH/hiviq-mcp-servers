import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import type { Reminder } from "../../types.js";
import { formatReminder, formatReminderList } from "./formatters.js";

export async function handleListReminders(client: SlackClient, args: unknown): Promise<ToolResult> {
  z.object({}).parse(args);
  const res = await client.listReminders();
  return { content: [{ type: "text", text: formatReminderList(res.reminders as Reminder[]) }] };
}

export async function handleAddReminder(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    text: z.string().min(1),
    time: z.string().min(1),
    user: z.string().optional(),
  }).parse(args);
  const res = await client.addReminder(params);
  return { content: [{ type: "text", text: `Reminder created!\n\n${formatReminder(res.reminder as Reminder)}` }] };
}

export async function handleDeleteReminder(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { reminder } = z.object({ reminder: z.string().min(1) }).parse(args);
  await client.deleteReminder({ reminder });
  return { content: [{ type: "text", text: `Reminder \`${reminder}\` deleted.` }] };
}

export async function handleCompleteReminder(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { reminder } = z.object({ reminder: z.string().min(1) }).parse(args);
  await client.completeReminder({ reminder });
  return { content: [{ type: "text", text: `Reminder \`${reminder}\` marked as complete.` }] };
}
