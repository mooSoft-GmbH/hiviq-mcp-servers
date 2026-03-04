import { z } from "zod";
import type { ConfluenceClient } from "../../client/confluence.js";
import type { ToolResult } from "../../types.js";
import { formatLabelList } from "./formatters.js";

export const LabelPageInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
});

export const AddLabelInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
  name: z.string().min(1, "label name is required"),
  prefix: z.string().optional().default("global"),
});

export const RemoveLabelInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
  name: z.string().min(1, "label name is required"),
  prefix: z.string().optional().default("global"),
});

export async function handleListLabels(client: ConfluenceClient, _baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId } = LabelPageInput.parse(args);
  const response = await client.listLabels(pageId);
  return { content: [{ type: "text", text: formatLabelList(response.results) }] };
}

export async function handleAddLabel(client: ConfluenceClient, _baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId, name, prefix } = AddLabelInput.parse(args);
  const response = await client.addLabel(pageId, name, prefix);
  return {
    content: [{ type: "text", text: `Label added.\n\n${formatLabelList(response.results)}` }],
  };
}

export async function handleRemoveLabel(client: ConfluenceClient, _baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId, name, prefix } = RemoveLabelInput.parse(args);
  await client.removeLabel(pageId, name, prefix);
  return { content: [{ type: "text", text: `Label \`${prefix}:${name}\` removed from page ${pageId}.` }] };
}
