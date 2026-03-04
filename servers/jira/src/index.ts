import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { JiraClient } from "./client/jira.js";
import { config } from "./config.js";
import { startHttpServer } from "./http-server.js";
import { createServer } from "./server.js";

async function main() {
  const client = new JiraClient(config);
  const baseUrl = config.JIRA_BASE_URL.replace(/\/$/, "");
  const transport = process.env["MCP_TRANSPORT"] ?? "stdio";

  if (transport === "http") {
    await startHttpServer(client, baseUrl);
  } else {
    const server = createServer(client, baseUrl);
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    process.stderr.write("hiviq-jira MCP server running on stdio\n");
  }
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
