import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { SlackClient } from "./client/slack.js";
import { createServer } from "./server.js";

const PORT = Number(process.env["MCP_PORT"] ?? 3000);

const sessions = new Map<string, WebStandardStreamableHTTPServerTransport>();

export function startHttpServer(client: SlackClient): void {
  Bun.serve({
    port: PORT,
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/health") {
        return new Response("ok", { status: 200 });
      }

      if (url.pathname === "/mcp") {
        const sessionId = req.headers.get("mcp-session-id");

        if (sessionId) {
          const existing = sessions.get(sessionId);
          if (!existing) return new Response("Session not found", { status: 404 });
          return existing.handleRequest(req);
        }

        let transport!: WebStandardStreamableHTTPServerTransport;
        transport = new WebStandardStreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized(id) {
            sessions.set(id, transport);
            process.stderr.write(`[mcp] session opened: ${id} (active: ${sessions.size})\n`);
          },
          onsessionclosed(id) {
            sessions.delete(id);
            process.stderr.write(`[mcp] session closed: ${id} (active: ${sessions.size})\n`);
          },
        });

        const mcpServer = createServer(client);
        await mcpServer.connect(transport);
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
