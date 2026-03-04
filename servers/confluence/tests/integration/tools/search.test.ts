import { describe, expect, it } from "bun:test";
import { ConfluenceClient } from "../../../src/client/confluence.js";
import { handleSearch, handleSearchText } from "../../../src/domains/search/handlers.js";
import searchFixture from "../../fixtures/search.json";

const BASE_URL = "https://moosoft.atlassian.net";

function makeClient(fixture: unknown): ConfluenceClient {
  const fetcher: typeof fetch = async () =>
    new Response(JSON.stringify(fixture), { status: 200, headers: { "Content-Type": "application/json" } });
  return new ConfluenceClient(
    { CONFLUENCE_BASE_URL: BASE_URL, CONFLUENCE_EMAIL: "t@t.com", CONFLUENCE_API_TOKEN: "tok" },
    fetcher,
  );
}

describe("handleSearch (integration)", () => {
  it("returns formatted search results", async () => {
    const client = makeClient(searchFixture);
    const result = await handleSearch(client, BASE_URL, { cql: "type = page" });
    expect(result.content[0]?.text).toContain("Getting Started");
    expect(result.content[0]?.text).toContain("TEAM");
  });

  it("rejects missing cql", async () => {
    const client = makeClient(searchFixture);
    await expect(handleSearch(client, BASE_URL, {})).rejects.toThrow();
  });
});

describe("handleSearchText (integration)", () => {
  it("builds CQL from text and returns results", async () => {
    let capturedUrl = "";
    const fetcher: typeof fetch = async (input) => {
      capturedUrl = input instanceof Request ? input.url : String(input);
      return new Response(JSON.stringify(searchFixture), { status: 200 });
    };
    const client = new ConfluenceClient(
      { CONFLUENCE_BASE_URL: BASE_URL, CONFLUENCE_EMAIL: "t@t.com", CONFLUENCE_API_TOKEN: "tok" },
      fetcher,
    );
    await handleSearchText(client, BASE_URL, { text: "deployment" });
    expect(capturedUrl).toContain("cql=");
    expect(decodeURIComponent(capturedUrl)).toContain("deployment");
  });

  it("appends spaceKey filter to CQL", async () => {
    let capturedUrl = "";
    const fetcher: typeof fetch = async (input) => {
      capturedUrl = input instanceof Request ? input.url : String(input);
      return new Response(JSON.stringify(searchFixture), { status: 200 });
    };
    const client = new ConfluenceClient(
      { CONFLUENCE_BASE_URL: BASE_URL, CONFLUENCE_EMAIL: "t@t.com", CONFLUENCE_API_TOKEN: "tok" },
      fetcher,
    );
    await handleSearchText(client, BASE_URL, { text: "api", spaceKey: "TEAM" });
    expect(decodeURIComponent(capturedUrl)).toContain("TEAM");
  });

  it("rejects missing text", async () => {
    const client = makeClient(searchFixture);
    await expect(handleSearchText(client, BASE_URL, {})).rejects.toThrow();
  });
});
