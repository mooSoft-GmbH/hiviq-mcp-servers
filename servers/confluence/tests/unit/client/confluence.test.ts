import { describe, expect, it } from "bun:test";
import { ConfluenceApiError, ConfluenceClient } from "../../../src/client/confluence.js";

const TEST_CONFIG = {
  CONFLUENCE_BASE_URL: "https://moosoft.atlassian.net",
  CONFLUENCE_EMAIL: "test@moosoft.com",
  CONFLUENCE_API_TOKEN: "test-token",
};

function makeOkFetcher(body: unknown, status = 200): typeof fetch {
  return async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
}

function makeErrorFetcher(status: number, statusText: string): typeof fetch {
  return async () => new Response("Not found", { status, statusText });
}

function makeCaptureFetcher(body: unknown): { fetcher: typeof fetch; calls: Request[] } {
  const calls: Request[] = [];
  const fetcher: typeof fetch = async (input) => {
    calls.push(input instanceof Request ? input : new Request(input));
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  return { fetcher, calls };
}

describe("ConfluenceClient", () => {
  describe("authentication", () => {
    it("sends Basic auth header", async () => {
      const captured: Headers[] = [];
      const fetcher: typeof fetch = async (_input, init) => {
        captured.push(new Headers(init?.headers));
        return new Response(JSON.stringify({ results: [] }), { status: 200 });
      };
      const client = new ConfluenceClient(TEST_CONFIG, fetcher);
      await client.listSpaces();

      const auth = captured[0]?.get("authorization") ?? "";
      expect(auth).toStartWith("Basic ");
      const decoded = Buffer.from(auth.replace("Basic ", ""), "base64").toString();
      expect(decoded).toBe("test@moosoft.com:test-token");
    });
  });

  describe("listSpaces", () => {
    it("calls the correct endpoint", async () => {
      const { fetcher, calls } = makeCaptureFetcher({ results: [] });
      const client = new ConfluenceClient(TEST_CONFIG, fetcher);
      await client.listSpaces();
      expect(calls[0]?.url).toContain("/wiki/api/v2/spaces");
    });

    it("passes limit param", async () => {
      const { fetcher, calls } = makeCaptureFetcher({ results: [] });
      const client = new ConfluenceClient(TEST_CONFIG, fetcher);
      await client.listSpaces({ limit: 50 });
      expect(calls[0]?.url).toContain("limit=50");
    });

    it("returns parsed response", async () => {
      const client = new ConfluenceClient(TEST_CONFIG, makeOkFetcher({ results: [{ id: "1", key: "TEAM" }] }));
      const result = await client.listSpaces();
      expect(result.results).toHaveLength(1);
      expect(result.results[0]?.key).toBe("TEAM");
    });
  });

  describe("error handling", () => {
    it("throws ConfluenceApiError on non-ok response", async () => {
      const client = new ConfluenceClient(TEST_CONFIG, makeErrorFetcher(404, "Not Found"));
      await expect(client.getPage("999")).rejects.toBeInstanceOf(ConfluenceApiError);
    });

    it("includes status code in error", async () => {
      const client = new ConfluenceClient(TEST_CONFIG, makeErrorFetcher(403, "Forbidden"));
      try {
        await client.getPage("999");
      } catch (e) {
        expect(e).toBeInstanceOf(ConfluenceApiError);
        expect((e as ConfluenceApiError).status).toBe(403);
      }
    });
  });

  describe("getPage", () => {
    it("requests body-format=storage", async () => {
      const { fetcher, calls } = makeCaptureFetcher({ id: "2001", title: "Test" });
      const client = new ConfluenceClient(TEST_CONFIG, fetcher);
      await client.getPage("2001");
      expect(calls[0]?.url).toContain("body-format=storage");
      expect(calls[0]?.url).toContain("/pages/2001");
    });
  });

  describe("search", () => {
    it("passes CQL as query param", async () => {
      const { fetcher, calls } = makeCaptureFetcher({ results: [], totalSize: 0, start: 0, limit: 25 });
      const client = new ConfluenceClient(TEST_CONFIG, fetcher);
      await client.search({ cql: "type = page" });
      expect(calls[0]?.url).toContain("cql=");
    });
  });

  describe("createPage", () => {
    it("sends POST with body", async () => {
      const methods: string[] = [];
      const fetcher: typeof fetch = async (_input, init) => {
        methods.push(init?.method ?? "GET");
        return new Response(JSON.stringify({ id: "999" }), { status: 200 });
      };
      const client = new ConfluenceClient(TEST_CONFIG, fetcher);
      await client.createPage({
        spaceId: "1001",
        title: "New",
        body: { representation: "storage", value: "<p>content</p>" },
      });
      expect(methods[0]).toBe("POST");
    });
  });

  describe("deletePage", () => {
    it("sends DELETE request", async () => {
      const methods: string[] = [];
      const fetcher: typeof fetch = async (_input, init) => {
        methods.push(init?.method ?? "GET");
        return new Response(null, { status: 204 });
      };
      const client = new ConfluenceClient(TEST_CONFIG, fetcher);
      await client.deletePage("2001");
      expect(methods[0]).toBe("DELETE");
    });
  });
});
