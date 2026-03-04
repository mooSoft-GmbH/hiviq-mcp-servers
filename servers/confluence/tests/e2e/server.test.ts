/**
 * E2E tests — full MCP protocol over InMemoryTransport.
 *
 * The entire stack runs in-process:
 *   MCP Client <--InMemoryTransport--> MCP Server <--mock fetcher--> Confluence API fixtures
 *
 * No network, no external services required.
 */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ConfluenceClient } from "../../src/client/confluence.js";
import { createServer } from "../../src/server.js";
import spacesFixture from "../fixtures/spaces.json";
import pagesFixture from "../fixtures/pages.json";
import searchFixture from "../fixtures/search.json";

const BASE_URL = "https://moosoft.atlassian.net";

// Routes fixture data by URL pattern
function makeRoutedFetcher(): typeof fetch {
  return async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    const routeMap: Array<[RegExp, unknown]> = [
      [/\/wiki\/api\/v2\/spaces\/\d+/, spacesFixture.single],
      [/\/wiki\/api\/v2\/spaces/, spacesFixture.list],
      [/\/wiki\/api\/v2\/pages\/\d+\/children/, pagesFixture.list],
      [/\/wiki\/api\/v2\/pages\/\d+\/ancestors/, pagesFixture.ancestors],
      [/\/wiki\/api\/v2\/pages\/\d+/, pagesFixture.single],
      [/\/wiki\/api\/v2\/pages/, pagesFixture.list],
      [/\/wiki\/rest\/api\/search/, searchFixture],
    ];

    for (const [pattern, fixture] of routeMap) {
      if (pattern.test(url)) {
        return new Response(JSON.stringify(fixture), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ results: [] }), { status: 200 });
  };
}

async function createTestPair() {
  const confluenceClient = new ConfluenceClient(
    { CONFLUENCE_BASE_URL: BASE_URL, CONFLUENCE_EMAIL: "t@t.com", CONFLUENCE_API_TOKEN: "tok" },
    makeRoutedFetcher(),
  );
  const server = createServer(confluenceClient, BASE_URL);
  const mcpClient = new Client({ name: "test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await mcpClient.connect(clientTransport);
  return { mcpClient, server };
}

describe("MCP Server — E2E", () => {
  let mcpClient: Client;

  beforeEach(async () => {
    ({ mcpClient } = await createTestPair());
  });

  afterEach(async () => {
    await mcpClient.close();
  });

  // ── Protocol compliance ────────────────────────────────────────────────────

  describe("listTools", () => {
    it("exposes all 19 tools", async () => {
      const { tools } = await mcpClient.listTools();
      expect(tools).toHaveLength(19);
    });

    it("every tool has a name and inputSchema", async () => {
      const { tools } = await mcpClient.listTools();
      for (const tool of tools) {
        expect(tool.name).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
      }
    });

    it("includes expected tool names", async () => {
      const { tools } = await mcpClient.listTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain("list_spaces");
      expect(names).toContain("get_page");
      expect(names).toContain("search");
      expect(names).toContain("list_blog_posts");
    });
  });

  // ── Spaces ─────────────────────────────────────────────────────────────────

  describe("list_spaces", () => {
    it("returns space list", async () => {
      const result = await mcpClient.callTool({ name: "list_spaces", arguments: {} });
      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Team Space");
    });

    it("returns isError for invalid args", async () => {
      const result = await mcpClient.callTool({ name: "list_spaces", arguments: { type: "invalid_type" } });
      expect(result.isError).toBe(true);
    });
  });

  describe("get_space", () => {
    it("returns single space detail", async () => {
      const result = await mcpClient.callTool({ name: "get_space", arguments: { spaceId: "1001" } });
      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Team Space");
      expect(text).toContain("TEAM");
    });

    it("returns isError for missing spaceId", async () => {
      const result = await mcpClient.callTool({ name: "get_space", arguments: {} });
      expect(result.isError).toBe(true);
    });
  });

  // ── Pages ──────────────────────────────────────────────────────────────────

  describe("list_pages", () => {
    it("returns page list", async () => {
      const result = await mcpClient.callTool({ name: "list_pages", arguments: { spaceId: "1001" } });
      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Getting Started");
    });
  });

  describe("get_page", () => {
    it("returns page with markdown body", async () => {
      const result = await mcpClient.callTool({ name: "get_page", arguments: { pageId: "2001" } });
      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("# Welcome");
      expect(text).toContain("**getting started**");
    });
  });

  describe("get_child_pages", () => {
    it("returns child pages", async () => {
      const result = await mcpClient.callTool({ name: "get_child_pages", arguments: { pageId: "2001" } });
      expect(result.isError).toBeFalsy();
    });
  });

  describe("get_ancestors", () => {
    it("returns ancestor breadcrumb", async () => {
      const result = await mcpClient.callTool({ name: "get_ancestors", arguments: { pageId: "2001" } });
      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Root Page");
    });
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  describe("search", () => {
    it("returns search results", async () => {
      const result = await mcpClient.callTool({ name: "search", arguments: { cql: "type = page" } });
      expect(result.isError).toBeFalsy();
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Getting Started");
    });

    it("returns isError for missing cql", async () => {
      const result = await mcpClient.callTool({ name: "search", arguments: {} });
      expect(result.isError).toBe(true);
    });
  });

  describe("search_text", () => {
    it("accepts free text query", async () => {
      const result = await mcpClient.callTool({ name: "search_text", arguments: { text: "getting started" } });
      expect(result.isError).toBeFalsy();
    });
  });

  // ── Unknown tool ───────────────────────────────────────────────────────────

  describe("unknown tool", () => {
    it("returns isError for unregistered tool name", async () => {
      const result = await mcpClient.callTool({ name: "does_not_exist", arguments: {} });
      expect(result.isError).toBe(true);
    });
  });
});
