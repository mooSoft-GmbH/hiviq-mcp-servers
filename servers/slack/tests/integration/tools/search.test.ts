import { describe, expect, it } from "bun:test";
import { SlackClient } from "../../../src/client/slack.js";
import { handleSearchFiles, handleSearchMessages } from "../../../src/domains/search/handlers.js";
import fixture from "../../fixtures/search.json";

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

describe("handleSearchMessages (integration)", () => {
  it("returns formatted search results", async () => {
    const client = makeClient(fixture.messages);
    const result = await handleSearchMessages(client, { query: "Deploy the new feature" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("Deploy the new feature");
    expect(result.content[0]?.text).toContain("engineering");
  });

  it("includes result count", async () => {
    const client = makeClient(fixture.messages);
    const result = await handleSearchMessages(client, { query: "test" });
    expect(result.content[0]?.text).toContain("1");
  });

  it("accepts sort and count options", async () => {
    const client = makeClient(fixture.messages);
    const result = await handleSearchMessages(client, { query: "test", sort: "timestamp", count: 10 });
    expect(result.isError).toBeUndefined();
  });

  it("rejects empty query", async () => {
    const client = makeClient(fixture.messages);
    await expect(handleSearchMessages(client, { query: "" })).rejects.toThrow();
  });

  it("rejects invalid sort value", async () => {
    const client = makeClient(fixture.messages);
    await expect(handleSearchMessages(client, { query: "test", sort: "invalid" })).rejects.toThrow();
  });
});

describe("handleSearchFiles (integration)", () => {
  it("returns formatted file results", async () => {
    const client = makeClient(fixture.files);
    const result = await handleSearchFiles(client, { query: "spec" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("spec.pdf");
    expect(result.content[0]?.text).toContain("Product Spec");
  });

  it("rejects missing query", async () => {
    const client = makeClient(fixture.files);
    await expect(handleSearchFiles(client, {})).rejects.toThrow();
  });
});
