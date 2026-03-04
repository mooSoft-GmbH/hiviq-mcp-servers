import { describe, expect, it } from "bun:test";
import { SlackClient } from "../../../src/client/slack.js";
import {
  handleGetConversationHistory,
  handleGetConversationInfo,
  handleGetConversationReplies,
  handleListConversations,
} from "../../../src/domains/conversations/handlers.js";
import fixture from "../../fixtures/conversations.json";

const TEST_CONFIG = {
  SLACK_BOT_TOKEN: "xoxb-test",
  SLACK_USER_TOKEN: "xoxp-test",
};

function makeClient(body: unknown): SlackClient {
  const fetcher: typeof fetch = async () =>
    new Response(JSON.stringify({ ok: true, ...(body as object) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  return new SlackClient(TEST_CONFIG, fetcher);
}

describe("handleListConversations (integration)", () => {
  it("returns formatted channel list", async () => {
    const client = makeClient(fixture.list);
    const result = await handleListConversations(client, {});
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("general");
    expect(result.content[0]?.text).toContain("engineering");
  });

  it("accepts limit and types args", async () => {
    const client = makeClient(fixture.list);
    const result = await handleListConversations(client, { limit: 50, types: "public_channel,private_channel" });
    expect(result.isError).toBeUndefined();
  });

  it("rejects limit > 999", async () => {
    const client = makeClient(fixture.list);
    await expect(handleListConversations(client, { limit: 1000 })).rejects.toThrow();
  });
});

describe("handleGetConversationInfo (integration)", () => {
  it("returns formatted channel details", async () => {
    const client = makeClient(fixture.info);
    const result = await handleGetConversationInfo(client, { channel: "C001" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("general");
  });

  it("rejects missing channel", async () => {
    const client = makeClient(fixture.info);
    await expect(handleGetConversationInfo(client, {})).rejects.toThrow();
  });
});

describe("handleGetConversationHistory (integration)", () => {
  it("returns formatted message list", async () => {
    const client = makeClient(fixture.history);
    const result = await handleGetConversationHistory(client, { channel: "C001" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("Hello team");
  });

  it("decodes Slack markup in messages", async () => {
    const client = makeClient(fixture.history);
    const result = await handleGetConversationHistory(client, { channel: "C001" });
    // "Check out <https://example.com|this link>" should be decoded
    expect(result.content[0]?.text).toContain("this link");
  });

  it("rejects missing channel", async () => {
    const client = makeClient(fixture.history);
    await expect(handleGetConversationHistory(client, {})).rejects.toThrow();
  });
});

describe("handleGetConversationReplies (integration)", () => {
  it("returns thread replies (excluding parent)", async () => {
    const client = makeClient(fixture.replies);
    const result = await handleGetConversationReplies(client, { channel: "C001", ts: "1711480001.000000" });
    expect(result.isError).toBeUndefined();
    // Should contain the reply but not the parent
    expect(result.content[0]?.text).toContain("Great point");
  });

  it("rejects missing ts", async () => {
    const client = makeClient(fixture.replies);
    await expect(handleGetConversationReplies(client, { channel: "C001" })).rejects.toThrow();
  });
});
