import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ConfluenceClient } from "./client/confluence.js";
import { config } from "./config.js";
import { createServer } from "./server.js";

async function main() {
  const client = new ConfluenceClient(config);
  const server = createServer(client, config.CONFLUENCE_BASE_URL);
  const transport = new StdioServerTransport();

  await server.connect(transport);

  process.stderr.write("hiviq-confluence MCP server running on stdio\n");
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
