import type { SearchResponse } from "../../types.js";

export function formatSearchResults(response: SearchResponse): string {
  if (response.results.length === 0) {
    return `No results found. (Total: 0)`;
  }

  const header = `Found **${response.totalSize}** result(s) — showing ${response.results.length} (start: ${response.start}):\n`;

  const rows = response.results.map((r, i) => {
    const space = r.space ?? r.content?.space;
    const spaceLabel = space ? ` \`[${space.key}]\`` : "";
    const excerpt = r.excerpt ? `\n  > ${r.excerpt.replace(/\n/g, " ")}` : "";
    return `${i + 1}. **${r.title}**${spaceLabel} — ${r.url}${excerpt}`;
  });

  return header + rows.join("\n\n");
}
