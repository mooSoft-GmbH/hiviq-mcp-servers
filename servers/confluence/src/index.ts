import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ConfluenceClient } from "./client/confluence.js";
import { config } from "./config.js";
import { startHttpServer } from "./http-server.js";
import { createServer } from "./server.js";

async function main() {
  const client = new ConfluenceClient(config);
  const transport = process.env["MCP_TRANSPORT"] ?? "stdio";

  if (transport === "http") {
    await startHttpServer(client, config.CONFLUENCE_BASE_URL);
  } else {
    const server = createServer(client, config.CONFLUENCE_BASE_URL);
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    process.stderr.write("hiviq-confluence MCP server running on stdio\n");
  }
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
