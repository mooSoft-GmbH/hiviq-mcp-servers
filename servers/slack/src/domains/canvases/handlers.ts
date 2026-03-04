import { z } from "zod";
import type { SlackClient } from "../../client/slack.js";
import type { ToolResult } from "../../types.js";
import type { Canvas } from "../../types.js";
import { formatCanvas } from "./formatters.js";

export async function handleCreateCanvas(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    title: z.string().optional(),
    document_content: z.record(z.unknown()).optional(),
  }).parse(args);
  const res = await client.createCanvas(params);
  return { content: [{ type: "text", text: `Canvas created!\n\n${formatCanvas(res as Canvas)}` }] };
}

export async function handleEditCanvas(client: SlackClient, args: unknown): Promise<ToolResult> {
  const params = z.object({
    canvas_id: z.string().min(1),
    changes: z.array(z.record(z.unknown())),
  }).parse(args);
  await client.editCanvas(params);
  return { content: [{ type: "text", text: `Canvas \`${params.canvas_id}\` updated with ${params.changes.length} change(s).` }] };
}

export async function handleDeleteCanvas(client: SlackClient, args: unknown): Promise<ToolResult> {
  const { canvas_id } = z.object({ canvas_id: z.string().min(1) }).parse(args);
  await client.deleteCanvas({ canvas_id });
  return { content: [{ type: "text", text: `Canvas \`${canvas_id}\` deleted.` }] };
}
