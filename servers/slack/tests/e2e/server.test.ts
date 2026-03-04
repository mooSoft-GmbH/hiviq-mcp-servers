/**
 * E2E tests — full MCP protocol over InMemoryTransport.
 *
 * The entire stack runs in-process:
 *   MCP Client <--InMemoryTransport--> MCP Server <--mock fetcher--> Slack API fixtures
 *
 * No network, no external services required.
 */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { SlackClient } from "../../src/client/slack.js";
import { createServer } from "../../src/server.js";
import messagingFixture from "../fixtures/messaging.json";
import conversationsFixture from "../fixtures/conversations.json";
import usersFixture from "../fixtures/users.json";
import searchFixture from "../fixtures/search.json";

const TEST_CONFIG = {
  SLACK_BOT_TOKEN: "xoxb-test",
  SLACK_USER_TOKEN: "xoxp-test",
};

// Routes mock responses by Slack API method name
function makeRoutedFetcher(): typeof fetch {
  return async (input) => {
    const url = input instanceof Request ? input.url : String(input);

    const routeMap: Array<[RegExp, unknown]> = [
      [/chat\.postMessage/, messagingFixture.post],
      [/chat\.update/, messagingFixture.update],
      [/chat\.delete/, { ok: true }],
      [/chat\.scheduleMessage/, messagingFixture.schedule],
      [/chat\.getPermalink/, messagingFixture.permalink],
      [/conversations\.list/, conversationsFixture.list],
      [/conversations\.info/, conversationsFixture.info],
      [/conversations\.history/, conversationsFixture.history],
      [/conversations\.replies/, conversationsFixture.replies],
      [/conversations\.create/, conversationsFixture.create],
      [/conversations\.archive/, { ok: true }],
      [/conversations\.join/, conversationsFixture.info],
      [/conversations\.leave/, { ok: true }],
      [/conversations\.rename/, conversationsFixture.info],
      [/conversations\.invite/, conversationsFixture.info],
      [/conversations\.kick/, { ok: true }],
      [/conversations\.open/, conversationsFixture.info],
      [/conversations\.setTopic/, { ok: true, topic: "New topic" }],
      [/conversations\.setPurpose/, { ok: true, purpose: "New purpose" }],
      [/users\.list/, usersFixture.list],
      [/users\.info/, usersFixture.info],
      [/users\.getPresence/, usersFixture.presence],
      [/users\.profile\.get/, { ok: true, profile: usersFixture.info.user.profile }],
      [/users\.lookupByEmail/, usersFixture.lookup],
      [/users\.setPresence/, { ok: true }],
      [/search\.messages/, searchFixture.messages],
      [/search\.files/, searchFixture.files],
      [/files\.list/, { ok: true, files: [], paging: { total: 0, page: 1, pages: 1 } }],
      [/files\.info/, { ok: true, file: { id: "F001", name: "test.pdf", title: "Test", mimetype: "application/pdf", size: 1024, permalink: "https://slack.com/files/F001" } }],
      [/files\.getUploadURLExternal/, { ok: true, upload_url: "https://files.slack.com/upload/v1/test", file_id: "F001" }],
      [/files\.completeUploadExternal/, { ok: true, files: [{ id: "F001", title: "Test" }] }],
      [/files\.delete/, { ok: true }],
      [/reactions\.add/, { ok: true }],
      [/reactions\.remove/, { ok: true }],
      [/reactions\.get/, { ok: true, message: { reactions: [{ name: "thumbsup", count: 1, users: ["U001"] }] } }],
      [/pins\.list/, { ok: true, items: [] }],
      [/pins\.add/, { ok: true }],
      [/pins\.remove/, { ok: true }],
      [/reminders\.list/, { ok: true, reminders: [] }],
      [/reminders\.add/, { ok: true, reminder: { id: "Rm001", text: "Test reminder", time: 1800000000 } }],
      [/reminders\.delete/, { ok: true }],
      [/reminders\.complete/, { ok: true }],
      [/team\.info/, { ok: true, team: { id: "T001", name: "mooSoft", domain: "moosoft", email_domain: "moosoft.de" } }],
      [/canvases\.create/, { ok: true, canvas_id: "F001" }],
      [/canvases\.edit/, { ok: true }],
      [/canvases\.delete/, { ok: true }],
      [/bookmarks\.list/, { ok: true, bookmarks: [] }],
      [/bookmarks\.add/, { ok: true, bookmark: { id: "Bk001", channel_id: "C001", title: "Test", type: "link", link: "https://example.com" } }],
      [/bookmarks\.edit/, { ok: true, bookmark: { id: "Bk001", channel_id: "C001", title: "Updated", type: "link" } }],
      [/bookmarks\.remove/, { ok: true }],
      [/usergroups\.list/, { ok: true, usergroups: [] }],
      [/usergroups\.create/, { ok: true, usergroup: { id: "S001", name: "dev-team", handle: "dev-team" } }],
      [/usergroups\.update/, { ok: true, usergroup: { id: "S001", name: "dev-team", handle: "dev-team" } }],
      [/usergroups\.users\.list/, { ok: true, users: ["U001"] }],
      [/usergroups\.users\.update/, { ok: true, usergroup: { id: "S001", users: ["U001"] } }],
    ];

    for (const [pattern, data] of routeMap) {
      if (pattern.test(url)) {
        return new Response(JSON.stringify({ ok: true, ...(data as object) }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
}

async function createTestPair() {
  const slackClient = new SlackClient(TEST_CONFIG, makeRoutedFetcher());
  const server = createServer(slackClient);
  const mcpClient = new Client({ name: "test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await mcpClient.connect(clientTransport);
  return { mcpClient, server };
}

type TextContent = Array<{ type: string; text: string }>;

describe("Slack MCP Server — E2E", () => {
  let mcpClient: Client;

  beforeEach(async () => {
    ({ mcpClient } = await createTestPair());
  });

  afterEach(async () => {
    await mcpClient.close();
  });

  // ── Protocol compliance ────────────────────────────────────────────────────

  describe("listTools", () => {
    it("exposes all 54 tools", async () => {
      const { tools } = await mcpClient.listTools();
      expect(tools).toHaveLength(54);
    });

    it("every tool has a name and inputSchema", async () => {
      const { tools } = await mcpClient.listTools();
      for (const tool of tools) {
        expect(tool.name).toBeTruthy();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
      }
    });

    it("includes expected tool names from each domain", async () => {
      const { tools } = await mcpClient.listTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain("post_message");
      expect(names).toContain("list_conversations");
      expect(names).toContain("list_users");
      expect(names).toContain("search_messages");
      expect(names).toContain("list_files");
      expect(names).toContain("add_reaction");
      expect(names).toContain("list_pins");
      expect(names).toContain("list_reminders");
      expect(names).toContain("get_team_info");
      expect(names).toContain("create_canvas");
      expect(names).toContain("list_bookmarks");
      expect(names).toContain("list_usergroups");
    });
  });

  // ── Messaging ──────────────────────────────────────────────────────────────

  describe("post_message", () => {
    it("returns success with channel and ts", async () => {
      const result = await mcpClient.callTool({
        name: "post_message",
        arguments: { channel: "C123456", text: "Hello!" },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("C123456");
    });

    it("returns isError for missing channel", async () => {
      const result = await mcpClient.callTool({ name: "post_message", arguments: { text: "hi" } });
      expect(result.isError).toBe(true);
    });
  });

  describe("schedule_message", () => {
    it("returns scheduled message details", async () => {
      const result = await mcpClient.callTool({
        name: "schedule_message",
        arguments: { channel: "C123456", text: "Future!", post_at: 1800000000 },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("Q123456");
    });
  });

  describe("get_permalink", () => {
    it("returns permalink URL", async () => {
      const result = await mcpClient.callTool({
        name: "get_permalink",
        arguments: { channel: "C123456", message_ts: "1711480000.0" },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("slack.com");
    });
  });

  // ── Conversations ──────────────────────────────────────────────────────────

  describe("list_conversations", () => {
    it("returns channel list", async () => {
      const result = await mcpClient.callTool({ name: "list_conversations", arguments: {} });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("general");
    });

    it("returns isError for invalid limit", async () => {
      const result = await mcpClient.callTool({ name: "list_conversations", arguments: { limit: 10000 } });
      expect(result.isError).toBe(true);
    });
  });

  describe("get_conversation_history", () => {
    it("returns message history", async () => {
      const result = await mcpClient.callTool({
        name: "get_conversation_history",
        arguments: { channel: "C001" },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("Hello team");
    });
  });

  describe("create_conversation", () => {
    it("returns new channel details", async () => {
      const result = await mcpClient.callTool({
        name: "create_conversation",
        arguments: { name: "new-channel" },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("Channel created");
    });
  });

  // ── Users ──────────────────────────────────────────────────────────────────

  describe("list_users", () => {
    it("returns user list", async () => {
      const result = await mcpClient.callTool({ name: "list_users", arguments: {} });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("moritz");
    });
  });

  describe("get_user_info", () => {
    it("returns user details", async () => {
      const result = await mcpClient.callTool({ name: "get_user_info", arguments: { user: "U001" } });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("Moritz Wilfer");
    });

    it("returns isError for missing user", async () => {
      const result = await mcpClient.callTool({ name: "get_user_info", arguments: {} });
      expect(result.isError).toBe(true);
    });
  });

  describe("lookup_user_by_email", () => {
    it("returns user by email", async () => {
      const result = await mcpClient.callTool({
        name: "lookup_user_by_email",
        arguments: { email: "moritz.wilfer@moosoft.de" },
      });
      expect(result.isError).toBeFalsy();
    });

    it("returns isError for invalid email", async () => {
      const result = await mcpClient.callTool({
        name: "lookup_user_by_email",
        arguments: { email: "not-an-email" },
      });
      expect(result.isError).toBe(true);
    });
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  describe("search_messages", () => {
    it("returns search results", async () => {
      const result = await mcpClient.callTool({
        name: "search_messages",
        arguments: { query: "Deploy" },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("Deploy the new feature");
    });

    it("returns isError for missing query", async () => {
      const result = await mcpClient.callTool({ name: "search_messages", arguments: {} });
      expect(result.isError).toBe(true);
    });
  });

  describe("search_files", () => {
    it("returns file results", async () => {
      const result = await mcpClient.callTool({
        name: "search_files",
        arguments: { query: "spec" },
      });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("spec.pdf");
    });
  });

  // ── Reactions ──────────────────────────────────────────────────────────────

  describe("add_reaction", () => {
    it("confirms reaction added", async () => {
      const result = await mcpClient.callTool({
        name: "add_reaction",
        arguments: { channel: "C001", timestamp: "1711480000.0", name: "thumbsup" },
      });
      expect(result.isError).toBeFalsy();
    });
  });

  // ── Team ───────────────────────────────────────────────────────────────────

  describe("get_team_info", () => {
    it("returns team details", async () => {
      const result = await mcpClient.callTool({ name: "get_team_info", arguments: {} });
      expect(result.isError).toBeFalsy();
      const text = (result.content as TextContent)[0]?.text ?? "";
      expect(text).toContain("mooSoft");
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
