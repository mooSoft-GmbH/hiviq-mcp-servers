import type { Canvas } from "../../types.js";

export function formatCanvas(canvas: Canvas): string {
  const lines: string[] = [];
  lines.push(`**${canvas.title ?? "Untitled canvas"}**  ID: \`${canvas.canvas_id}\``);
  return lines.join("\n");
}
