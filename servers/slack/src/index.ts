import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SlackClient } from "./client/slack.js";
import { config } from "./config.js";
import { startHttpServer } from "./http-server.js";
import { createServer } from "./server.js";

async function main() {
  const client = new SlackClient(config);
  const transport = process.env["MCP_TRANSPORT"] ?? "stdio";

  if (transport === "http") {
    await startHttpServer(client);
  } else {
    const server = createServer(client);
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    process.stderr.write("hiviq-slack MCP server running on stdio\n");
  }
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
