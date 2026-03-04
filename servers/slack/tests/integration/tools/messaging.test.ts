import { describe, expect, it } from "bun:test";
import { SlackClient } from "../../../src/client/slack.js";
import {
  handleDeleteMessage,
  handleGetPermalink,
  handlePostMessage,
  handleScheduleMessage,
  handleUpdateMessage,
} from "../../../src/domains/messaging/handlers.js";
import fixture from "../../fixtures/messaging.json";

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

describe("handlePostMessage (integration)", () => {
  it("returns formatted confirmation with channel and ts", async () => {
    const client = makeClient(fixture.post);
    const result = await handlePostMessage(client, { channel: "C123456", text: "Hello!" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("C123456");
    expect(result.content[0]?.text).toContain("1711480000.123456");
  });

  it("rejects missing channel", async () => {
    const client = makeClient(fixture.post);
    await expect(handlePostMessage(client, { text: "hi" })).rejects.toThrow();
  });

  it("rejects empty channel", async () => {
    const client = makeClient(fixture.post);
    await expect(handlePostMessage(client, { channel: "", text: "hi" })).rejects.toThrow();
  });
});

describe("handleUpdateMessage (integration)", () => {
  it("returns updated channel and ts", async () => {
    const client = makeClient(fixture.update);
    const result = await handleUpdateMessage(client, { channel: "C123456", ts: "1711480000.123456", text: "Updated" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("C123456");
  });

  it("rejects missing ts", async () => {
    const client = makeClient(fixture.update);
    await expect(handleUpdateMessage(client, { channel: "C123456" })).rejects.toThrow();
  });
});

describe("handleDeleteMessage (integration)", () => {
  it("confirms deletion with channel and ts", async () => {
    const client = makeClient({ ok: true });
    const result = await handleDeleteMessage(client, { channel: "C123456", ts: "1711480000.0" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("C123456");
    expect(result.content[0]?.text).toContain("1711480000.0");
  });
});

describe("handleScheduleMessage (integration)", () => {
  it("returns scheduled message ID and channel", async () => {
    const client = makeClient(fixture.schedule);
    const result = await handleScheduleMessage(client, {
      channel: "C123456",
      text: "Scheduled!",
      post_at: 1800000000,
    });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("Q123456");
    expect(result.content[0]?.text).toContain("C123456");
  });

  it("rejects non-integer post_at", async () => {
    const client = makeClient(fixture.schedule);
    await expect(
      handleScheduleMessage(client, { channel: "C1", text: "hi", post_at: 1.5 }),
    ).rejects.toThrow();
  });
});

describe("handleGetPermalink (integration)", () => {
  it("returns permalink URL and channel", async () => {
    const client = makeClient(fixture.permalink);
    const result = await handleGetPermalink(client, { channel: "C123456", message_ts: "1711480000.123456" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("moosoft.slack.com");
    expect(result.content[0]?.text).toContain("C123456");
  });
});
