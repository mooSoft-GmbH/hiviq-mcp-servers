import type { Label } from "../../types.js";

export function formatLabelList(labels: Label[]): string {
  if (labels.length === 0) return "No labels found.";
  return `Labels (${labels.length}):\n` + labels.map((l) => `- \`${l.prefix}:${l.name}\` (ID: ${l.id})`).join("\n");
}
