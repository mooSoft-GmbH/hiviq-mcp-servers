import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { SlackClient } from "./client/slack.js";
import { createServer } from "./server.js";

const PORT = Number(process.env["MCP_PORT"] ?? 3000);

export async function startHttpServer(client: SlackClient): Promise<void> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined as unknown as (() => string),
  });

  const mcpServer = createServer(client);
  await mcpServer.connect(transport);

  Bun.serve({
    port: PORT,
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/health") {
        return new Response("ok", { status: 200 });
      }

      if (url.pathname === "/mcp") {
        return transport.handleRequest(req);
      }

      return new Response("Not Found", { status: 404 });
    },
    error(err) {
      process.stderr.write(`[server error] ${err.message}\n`);
      return new Response("Internal Server Error", { status: 500 });
    },
  });

  process.stderr.write(`hiviq-slack MCP server listening on http://0.0.0.0:${PORT}/mcp\n`);
}
