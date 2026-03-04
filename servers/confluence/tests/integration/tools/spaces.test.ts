import { describe, expect, it } from "bun:test";
import { ConfluenceClient } from "../../../src/client/confluence.js";
import { handleGetSpace, handleListSpaces } from "../../../src/domains/spaces/handlers.js";
import spacesFixture from "../../fixtures/spaces.json";

const BASE_URL = "https://moosoft.atlassian.net";

function makeClient(fixture: unknown): ConfluenceClient {
  const fetcher: typeof fetch = async () =>
    new Response(JSON.stringify(fixture), { status: 200, headers: { "Content-Type": "application/json" } });
  return new ConfluenceClient(
    { CONFLUENCE_BASE_URL: BASE_URL, CONFLUENCE_EMAIL: "t@t.com", CONFLUENCE_API_TOKEN: "tok" },
    fetcher,
  );
}

describe("handleListSpaces (integration)", () => {
  it("returns formatted space list", async () => {
    const client = makeClient(spacesFixture.list);
    const result = await handleListSpaces(client, BASE_URL, {});
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("Team Space");
    expect(result.content[0]?.text).toContain("Architecture");
  });

  it("accepts limit argument", async () => {
    const client = makeClient(spacesFixture.list);
    const result = await handleListSpaces(client, BASE_URL, { limit: 10 });
    expect(result.isError).toBeUndefined();
  });

  it("rejects invalid limit", async () => {
    const client = makeClient(spacesFixture.list);
    await expect(handleListSpaces(client, BASE_URL, { limit: -1 })).rejects.toThrow();
  });

  it("rejects invalid type", async () => {
    const client = makeClient(spacesFixture.list);
    await expect(handleListSpaces(client, BASE_URL, { type: "invalid" })).rejects.toThrow();
  });
});

describe("handleGetSpace (integration)", () => {
  it("returns formatted single space", async () => {
    const client = makeClient(spacesFixture.single);
    const result = await handleGetSpace(client, BASE_URL, { spaceId: "1001" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("# Team Space");
    expect(result.content[0]?.text).toContain("TEAM");
  });

  it("rejects missing spaceId", async () => {
    const client = makeClient(spacesFixture.single);
    await expect(handleGetSpace(client, BASE_URL, {})).rejects.toThrow();
  });
});
