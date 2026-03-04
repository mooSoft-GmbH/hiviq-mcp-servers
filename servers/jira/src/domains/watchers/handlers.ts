import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { formatWatchers } from "./formatters.js";

const ListWatchersInput = z.object({ issueIdOrKey: z.string().min(1) });
const AddWatcherInput = z.object({ issueIdOrKey: z.string().min(1), accountId: z.string().min(1) });
const RemoveWatcherInput = z.object({
  issueIdOrKey: z.string().min(1),
  accountId: z.string().min(1),
});

export async function handleListWatchers(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey } = ListWatchersInput.parse(args);
  const watchers = await client.listWatchers(issueIdOrKey);
  return { content: [{ type: "text", text: formatWatchers(watchers) }] };
}

export async function handleAddWatcher(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, accountId } = AddWatcherInput.parse(args);
  await client.addWatcher(issueIdOrKey, accountId);
  return {
    content: [{ type: "text", text: `User \`${accountId}\` added as watcher to ${issueIdOrKey}.` }],
  };
}

export async function handleRemoveWatcher(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, accountId } = RemoveWatcherInput.parse(args);
  await client.removeWatcher(issueIdOrKey, accountId);
  return {
    content: [
      { type: "text", text: `User \`${accountId}\` removed from watchers on ${issueIdOrKey}.` },
    ],
  };
}
