import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import type { Bookmark } from "../../types.js";
import { formatBookmark, formatBookmarkList } from "./formatters.js";

export async function handleListBookmarks(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel_id } = z.object({ channel_id: z.string().min(1) }).parse(args);
  const res = await client.listBookmarks({ channel_id });
  return { content: [{ type: "text", text: formatBookmarkList(res.bookmarks as Bookmark[], channel_id) }] };
}

export async function handleAddBookmark(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    channel_id: z.string().min(1),
    title: z.string().min(1),
    type: z.string().min(1),
    link: z.string().optional(),
    emoji: z.string().optional(),
  }).parse(args);
  const res = await client.addBookmark(params);
  return { content: [{ type: "text", text: `Bookmark added!\n\n${formatBookmark(res.bookmark as Bookmark)}` }] };
}

export async function handleEditBookmark(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    channel_id: z.string().min(1),
    bookmark_id: z.string().min(1),
    title: z.string().optional(),
    link: z.string().optional(),
    emoji: z.string().optional(),
  }).parse(args);
  const res = await client.editBookmark(params);
  return { content: [{ type: "text", text: `Bookmark updated.\n\n${formatBookmark(res.bookmark as Bookmark)}` }] };
}

export async function handleRemoveBookmark(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { channel_id, bookmark_id } = z.object({
    channel_id: z.string().min(1),
    bookmark_id: z.string().min(1),
  }).parse(args);
  await client.removeBookmark({ channel_id, bookmark_id });
  return { content: [{ type: "text", text: `Bookmark \`${bookmark_id}\` removed from \`${channel_id}\`.` }] };
}
