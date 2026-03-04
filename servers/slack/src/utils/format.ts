/**
 * Decodes Slack's mrkdwn format to readable plain text.
 * Slack uses: <@U123> for users, <#C123|name> for channels, <url|text> for links.
 */
export function decodeSlackText(text: string): string {
  return text
    .replace(/<@([A-Z0-9]+)>/g, "@$1")
    .replace(/<#([A-Z0-9]+)\|([^>]+)>/g, "#$2")
    .replace(/<([^|>]+)\|([^>]+)>/g, "$2 ($1)")
    .replace(/<([^>]+)>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function formatTs(ts: string): string {
  const ms = Math.floor(parseFloat(ts) * 1000);
  return new Date(ms).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export function formatUnix(unix: number): string {
  return new Date(unix * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function truncate(text: string, max = 200): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "…";
}
