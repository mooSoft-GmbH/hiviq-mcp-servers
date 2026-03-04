import { describe, expect, it } from "bun:test";
import { ConfluenceClient } from "../../../src/client/confluence.js";
import {
  handleCreatePage,
  handleDeletePage,
  handleGetAncestors,
  handleGetChildPages,
  handleGetPage,
  handleListPages,
  handleUpdatePage,
} from "../../../src/domains/pages/handlers.js";
import pagesFixture from "../../fixtures/pages.json";

const BASE_URL = "https://moosoft.atlassian.net";

function makeClient(fixture: unknown): ConfluenceClient {
  const fetcher: typeof fetch = async () =>
    new Response(JSON.stringify(fixture), { status: 200, headers: { "Content-Type": "application/json" } });
  return new ConfluenceClient(
    { CONFLUENCE_BASE_URL: BASE_URL, CONFLUENCE_EMAIL: "t@t.com", CONFLUENCE_API_TOKEN: "tok" },
    fetcher,
  );
}

function makeDeleteClient(): ConfluenceClient {
  const fetcher: typeof fetch = async () => new Response(null, { status: 204 });
  return new ConfluenceClient(
    { CONFLUENCE_BASE_URL: BASE_URL, CONFLUENCE_EMAIL: "t@t.com", CONFLUENCE_API_TOKEN: "tok" },
    fetcher,
  );
}

describe("handleListPages (integration)", () => {
  it("returns formatted page list", async () => {
    const client = makeClient(pagesFixture.list);
    const result = await handleListPages(client, BASE_URL, {});
    expect(result.content[0]?.text).toContain("Getting Started");
    expect(result.content[0]?.text).toContain("API Reference");
  });

  it("accepts spaceId filter", async () => {
    const client = makeClient(pagesFixture.list);
    const result = await handleListPages(client, BASE_URL, { spaceId: "1001" });
    expect(result.isError).toBeUndefined();
  });
});

describe("handleGetPage (integration)", () => {
  it("renders body as markdown", async () => {
    const client = makeClient(pagesFixture.single);
    const result = await handleGetPage(client, BASE_URL, { pageId: "2001" });
    expect(result.content[0]?.text).toContain("# Welcome");
    expect(result.content[0]?.text).toContain("**getting started**");
  });

  it("rejects missing pageId", async () => {
    const client = makeClient(pagesFixture.single);
    await expect(handleGetPage(client, BASE_URL, {})).rejects.toThrow();
  });
});

describe("handleGetChildPages (integration)", () => {
  it("returns child page list", async () => {
    const client = makeClient(pagesFixture.list);
    const result = await handleGetChildPages(client, BASE_URL, { pageId: "2001" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain("Getting Started");
  });
});

describe("handleGetAncestors (integration)", () => {
  it("returns ancestor breadcrumb", async () => {
    const client = makeClient(pagesFixture.ancestors);
    const result = await handleGetAncestors(client, BASE_URL, { pageId: "2001" });
    expect(result.content[0]?.text).toContain("Root Page");
    expect(result.content[0]?.text).toContain("Documentation");
  });
});

describe("handleCreatePage (integration)", () => {
  it("returns success message with new page ID", async () => {
    const client = makeClient(pagesFixture.created);
    const result = await handleCreatePage(client, BASE_URL, {
      spaceId: "1001",
      title: "New Page",
      content: "<p>Hello</p>",
    });
    expect(result.content[0]?.text).toContain("created successfully");
    expect(result.content[0]?.text).toContain("2003");
  });

  it("rejects missing required fields", async () => {
    const client = makeClient(pagesFixture.created);
    await expect(handleCreatePage(client, BASE_URL, { title: "No space" })).rejects.toThrow();
  });
});

describe("handleUpdatePage (integration)", () => {
  it("returns success message", async () => {
    const client = makeClient({ ...pagesFixture.single, version: { number: 4, createdAt: "" } });
    const result = await handleUpdatePage(client, BASE_URL, {
      pageId: "2001",
      title: "Updated Title",
      content: "<p>Updated</p>",
      versionNumber: 3,
    });
    expect(result.content[0]?.text).toContain("updated successfully");
  });
});

describe("handleDeletePage (integration)", () => {
  it("returns success message", async () => {
    const client = makeDeleteClient();
    const result = await handleDeletePage(client, BASE_URL, { pageId: "2001" });
    expect(result.content[0]?.text).toContain("deleted successfully");
  });
});
