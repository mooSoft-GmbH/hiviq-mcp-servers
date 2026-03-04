/**
 * E2E tests — full MCP protocol over InMemoryTransport.
 *
 * The entire stack runs in-process:
 *   MCP Client <--InMemoryTransport--> MCP Server <--mock fetcher--> Jira API fixtures
 *
 * No network, no external services required.
 */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { JiraClient } from "../../src/client/jira.js";
import { createServer } from "../../src/server.js";
import issuesFixture from "../fixtures/issues.json";
import projectsFixture from "../fixtures/projects.json";
import commentsFixture from "../fixtures/comments.json";
import sprintsFixture from "../fixtures/sprints.json";
import boardsFixture from "../fixtures/boards.json";

const BASE_URL = "https://moosoft.atlassian.net";

function makeRoutedFetcher(): typeof fetch {
  return async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    const routeMap: Array<[RegExp, unknown]> = [
      // Agile routes (must come before platform routes)
      [/\/rest\/agile\/1\.0\/board\/\d+\/sprint/, sprintsFixture.list],
      [/\/rest\/agile\/1\.0\/board\/\d+\/configuration/, boardsFixture.config],
      [/\/rest\/agile\/1\.0\/board\/\d+/, boardsFixture.single],
      [/\/rest\/agile\/1\.0\/board/, boardsFixture.list],
      [/\/rest\/agile\/1\.0\/sprint\/\d+/, sprintsFixture.single],
      // Platform routes
      [/\/rest\/api\/3\/search\/jql/, issuesFixture.searchResult],
      [/\/rest\/api\/3\/issue\/[^/]+\/comment\//, commentsFixture.created],
      [/\/rest\/api\/3\/issue\/[^/]+\/comment/, commentsFixture.list],
      [/\/rest\/api\/3\/issue\/[^/]+\/transitions/, issuesFixture.transitions],
      [/\/rest\/api\/3\/issue\/[^/]+\/changelog/, issuesFixture.changelogs],
      [/\/rest\/api\/3\/issue\/[^/]+/, issuesFixture.single],
      [/\/rest\/api\/3\/project\/[^/]+\/components/, projectsFixture.components],
      [/\/rest\/api\/3\/project\/[^/]+\/version/, projectsFixture.versions],
      [/\/rest\/api\/3\/project\/search/, projectsFixture.list],
      [/\/rest\/api\/3\/project\/[^/]+/, projectsFixture.single],
      [/\/rest\/api\/3\/myself/, { accountId: "user-abc", displayName: "Test User", active: true }],
      [/\/rest\/api\/3\/issuetype/, issuesFixture.issueTypes],
      [/\/rest\/api\/3\/serverInfo/, { baseUrl: BASE_URL, version: "1001.0.0", deploymentType: "Cloud", buildNumber: 100000 }],
    ];

    for (const [pattern, fixture] of routeMap) {
      if (pattern.test(url)) {
        return new Response(JSON.stringify(fixture), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({}), { status: 200 });
  };
}

async function createTestPair() {
  const jiraClient = new JiraClient(
    { JIRA_BASE_URL: BASE_URL, JIRA_EMAIL: "t@t.com", JIRA_API_TOKEN: "tok" },
    makeRoutedFetcher(),
  );
  const server = createServer(jiraClient, BASE_URL);
  const mcpClient = new Client({ name: "test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await mcpClient.connect(clientTransport);
  return { mcpClient, server };
}

describe("Jira MCP Server — E2E", () => {
  let mcpClient: Client;

  beforeEach(async () => {
    ({ mcpClient } = await createTestPair());
  });

  afterEach(async () => {
    await mcpClient.close();
  });

  describe("listTools", () => {
    it("exposes all tools (65+)", async () => {
      const { tools } = await mcpClient.listTools();
      expect(tools.length).toBeGreaterThanOrEqual(65);
    });

    it("every tool has a name, description, and inputSchema", async () => {
      const { tools } = await mcpClient.listTools();
      for (const tool of tools) {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
      }
    });

    it("tool names are unique", async () => {
      const { tools } = await mcpClient.listTools();
      const names = tools.map((t) => t.name);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  describe("tool calls", () => {
    it("get_issue returns issue data", async () => {
      const result = await mcpClient.callTool({
        name: "get_issue",
        arguments: { issueIdOrKey: "PROJ-1" },
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("PROJ-1");
      expect(text).toContain("Implement user authentication");
    });

    it("search_issues returns results", async () => {
      const result = await mcpClient.callTool({
        name: "search_issues",
        arguments: { jql: "project = PROJ" },
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Found 2 issue(s)");
    });

    it("list_comments returns comments", async () => {
      const result = await mcpClient.callTool({
        name: "list_comments",
        arguments: { issueIdOrKey: "PROJ-1" },
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Moritz Wilfer");
      expect(text).toContain("Started working on this.");
    });

    it("list_projects returns projects", async () => {
      const result = await mcpClient.callTool({
        name: "list_projects",
        arguments: {},
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("My Project");
    });

    it("get_myself returns user info", async () => {
      const result = await mcpClient.callTool({
        name: "get_myself",
        arguments: {},
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Test User");
    });

    it("list_boards returns boards", async () => {
      const result = await mcpClient.callTool({
        name: "list_boards",
        arguments: {},
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("PROJ Board");
    });

    it("list_sprints returns sprints", async () => {
      const result = await mcpClient.callTool({
        name: "list_sprints",
        arguments: { boardId: 1 },
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Sprint 1");
    });

    it("get_server_info returns server details", async () => {
      const result = await mcpClient.callTool({
        name: "get_server_info",
        arguments: {},
      });
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Cloud");
    });
  });

  describe("error handling", () => {
    it("returns error for unknown tool", async () => {
      const result = await mcpClient.callTool({
        name: "nonexistent_tool",
        arguments: {},
      });
      expect(result.isError).toBe(true);
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Unknown tool");
    });

    it("returns validation error for invalid arguments", async () => {
      const result = await mcpClient.callTool({
        name: "get_issue",
        arguments: {},
      });
      expect(result.isError).toBe(true);
      const text = (result.content as Array<{ type: string; text: string }>)[0]?.text ?? "";
      expect(text).toContain("Invalid arguments");
    });

    it("returns validation error for empty required string", async () => {
      const result = await mcpClient.callTool({
        name: "get_issue",
        arguments: { issueIdOrKey: "" },
      });
      expect(result.isError).toBe(true);
    });
  });
});
