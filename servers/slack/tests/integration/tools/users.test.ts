import { describe, expect, it } from "bun:test";
import { SlackClient } from "../../../src/client/slack.js";
import {
  handleGetUserInfo,
  handleGetUserPresence,
  handleListUsers,
  handleLookupUserByEmail,
} from "../../../src/domains/users/handlers.js";
import fixture from "../../fixtures/users.json";

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

describe("handleListUsers (integration)", () => {
  it("returns formatted user list", async () => {
    const client = makeClient(fixture.list);
    const result = await handleListUsers(client, {});
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("moritz");
    expect(result.content[0]?.text).toContain("Claude");
  });

  it("accepts limit and cursor", async () => {
    const client = makeClient(fixture.list);
    const result = await handleListUsers(client, { limit: 50 });
    expect(result.isError).toBeUndefined();
  });

  it("rejects limit > 999", async () => {
    const client = makeClient(fixture.list);
    await expect(handleListUsers(client, { limit: 1000 })).rejects.toThrow();
  });
});

describe("handleGetUserInfo (integration)", () => {
  it("returns formatted user details", async () => {
    const client = makeClient(fixture.info);
    const result = await handleGetUserInfo(client, { user: "U001" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("Moritz Wilfer");
  });

  it("rejects missing user", async () => {
    const client = makeClient(fixture.info);
    await expect(handleGetUserInfo(client, {})).rejects.toThrow();
  });
});

describe("handleGetUserPresence (integration)", () => {
  it("returns presence status", async () => {
    const client = makeClient(fixture.presence);
    const result = await handleGetUserPresence(client, { user: "U001" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("active");
  });
});

describe("handleLookupUserByEmail (integration)", () => {
  it("returns user by email", async () => {
    const client = makeClient(fixture.lookup);
    const result = await handleLookupUserByEmail(client, { email: "moritz.wilfer@moosoft.de" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("Moritz Wilfer");
  });

  it("rejects invalid email", async () => {
    const client = makeClient(fixture.lookup);
    await expect(handleLookupUserByEmail(client, { email: "not-an-email" })).rejects.toThrow();
  });
});
