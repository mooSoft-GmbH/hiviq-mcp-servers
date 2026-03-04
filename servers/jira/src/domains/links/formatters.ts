import type { JiraIssueLinkType, JiraRemoteLink } from "../../types.js";

export function formatLinkTypes(types: JiraIssueLinkType[]): string {
  if (types.length === 0) return "No link types found.";

  const lines = [`Found ${types.length} link type(s):`, ""];
  for (const t of types) {
    lines.push(`- **${t.name}** (ID: \`${t.id}\`) — inward: "${t.inward}" / outward: "${t.outward}"`);
  }
  return lines.join("\n");
}

export function formatRemoteLinks(links: JiraRemoteLink[]): string {
  if (links.length === 0) return "No remote links found.";

  const lines = [`Found ${links.length} remote link(s):`, ""];
  for (const l of links) {
    const app = l.application?.name ? ` (${l.application.name})` : "";
    const summary = l.object.summary ? ` — ${l.object.summary}` : "";
    lines.push(`- **${l.object.title}**${app}: ${l.object.url}${summary} — ID: \`${l.id}\``);
  }
  return lines.join("\n");
}
