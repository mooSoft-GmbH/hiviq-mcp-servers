import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import type { SlackFile } from "../../types.js";
import { formatFile, formatFileList } from "./formatters.js";

export async function handleListFiles(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    channel: z.string().optional(),
    user: z.string().optional(),
    types: z.string().optional(),
    count: z.number().int().min(1).max(1000).optional().default(20),
    page: z.number().int().min(1).optional(),
  }).parse(args);
  const res = await client.listFiles(params);
  return { content: [{ type: "text", text: formatFileList(res.files as SlackFile[]) }] };
}

export async function handleGetFileInfo(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { file } = z.object({ file: z.string().min(1) }).parse(args);
  const res = await client.getFileInfo({ file });
  return { content: [{ type: "text", text: formatFile(res.file as SlackFile) }] };
}

export async function handleUploadFile(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    channels: z.string().min(1),
    content: z.string().min(1),
    filename: z.string().min(1),
    filetype: z.string().optional(),
    title: z.string().optional(),
    initial_comment: z.string().optional(),
    thread_ts: z.string().optional(),
  }).parse(args);
  const res = await client.uploadFile(params);
  return { content: [{ type: "text", text: `File uploaded!\n\n${formatFile(res.file as SlackFile)}` }] };
}

export async function handleDeleteFile(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { file } = z.object({ file: z.string().min(1) }).parse(args);
  await client.deleteFile({ file });
  return { content: [{ type: "text", text: `File \`${file}\` deleted.` }] };
}
