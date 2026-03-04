import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { ConfluenceClient } from "./client/confluence.js";
import { createServer } from "./server.js";

const PORT = Number(process.env["MCP_PORT"] ?? 3000);

// Session map: sessionId → transport
const sessions = new Map<string, WebStandardStreamableHTTPServerTransport>();

export function startHttpServer(client: ConfluenceClient, baseUrl: string): void {
  Bun.serve({
    port: PORT,

    async fetch(req) {
      const url = new URL(req.url);

      // Health check — used by k8s liveness/readiness probes
      if (url.pathname === "/health") {
        return new Response("ok", { status: 200 });
      }

      // MCP endpoint
      if (url.pathname === "/mcp") {
        const sessionId = req.headers.get("mcp-session-id");

        // Reuse existing session transport
        if (sessionId) {
          const existing = sessions.get(sessionId);
          if (!existing) {
            return new Response("Session not found", { status: 404 });
          }
          return existing.handleRequest(req);
        }

        // New session — create a fresh transport + MCP server pair
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

        const mcpServer = createServer(client, baseUrl);
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

  process.stderr.write(`hiviq-confluence MCP server listening on http://0.0.0.0:${PORT}/mcp\n`);
}
