import { describe, expect, it } from "bun:test";
import { JiraApiError, JiraClient } from "../../src/client/jira.js";

const TEST_CONFIG = {
  JIRA_BASE_URL: "https://moosoft.atlassian.net",
  JIRA_EMAIL: "test@moosoft.com",
  JIRA_API_TOKEN: "test-token",
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

describe("JiraClient", () => {
  describe("authentication", () => {
    it("sends Basic auth header", async () => {
      const captured: Headers[] = [];
      const fetcher: typeof fetch = async (_input, init) => {
        captured.push(new Headers(init?.headers));
        return new Response(JSON.stringify({}), { status: 200 });
      };
      const client = new JiraClient(TEST_CONFIG, fetcher);
      await client.getMyself();

      const auth = captured[0]?.get("authorization") ?? "";
      expect(auth).toStartWith("Basic ");
      const decoded = Buffer.from(auth.replace("Basic ", ""), "base64").toString();
      expect(decoded).toBe("test@moosoft.com:test-token");
    });
  });

  describe("request routing", () => {
    it("uses /rest/api/3 for platform API calls", async () => {
      let capturedUrl = "";
      const fetcher: typeof fetch = async (input) => {
        capturedUrl = input instanceof Request ? input.url : String(input);
        return new Response(JSON.stringify({}), { status: 200 });
      };
      const client = new JiraClient(TEST_CONFIG, fetcher);
      await client.getMyself();
      expect(capturedUrl).toContain("/rest/api/3/myself");
    });

    it("uses /rest/agile/1.0 for agile API calls", async () => {
      let capturedUrl = "";
      const fetcher: typeof fetch = async (input) => {
        capturedUrl = input instanceof Request ? input.url : String(input);
        return new Response(JSON.stringify({ values: [] }), { status: 200 });
      };
      const client = new JiraClient(TEST_CONFIG, fetcher);
      await client.listBoards();
      expect(capturedUrl).toContain("/rest/agile/1.0/board");
    });
  });

  describe("error handling", () => {
    it("throws JiraApiError on non-ok response", async () => {
      const client = new JiraClient(TEST_CONFIG, makeErrorFetcher(404, "Not Found"));
      await expect(client.getIssue("PROJ-999")).rejects.toBeInstanceOf(JiraApiError);
    });

    it("includes status and message in error", async () => {
      const client = new JiraClient(TEST_CONFIG, makeErrorFetcher(403, "Forbidden"));
      try {
        await client.getIssue("PROJ-1");
        expect(true).toBe(false); // should not reach
      } catch (err) {
        expect(err).toBeInstanceOf(JiraApiError);
        const apiErr = err as JiraApiError;
        expect(apiErr.status).toBe(403);
        expect(apiErr.statusText).toBe("Forbidden");
      }
    });
  });

  describe("methods", () => {
    it("getIssue calls correct endpoint", async () => {
      let capturedUrl = "";
      const fetcher: typeof fetch = async (input) => {
        capturedUrl = String(input);
        return new Response(JSON.stringify({ id: "1", key: "PROJ-1", fields: {} }), {
          status: 200,
        });
      };
      const client = new JiraClient(TEST_CONFIG, fetcher);
      await client.getIssue("PROJ-1");
      expect(capturedUrl).toBe("https://moosoft.atlassian.net/rest/api/3/issue/PROJ-1");
    });

    it("searchIssues uses /search/jql endpoint", async () => {
      let capturedUrl = "";
      const fetcher: typeof fetch = async (input) => {
        capturedUrl = String(input);
        return new Response(JSON.stringify({ issues: [], total: 0, startAt: 0, maxResults: 50 }), {
          status: 200,
        });
      };
      const client = new JiraClient(TEST_CONFIG, fetcher);
      await client.searchIssues({ jql: "project = PROJ" });
      expect(capturedUrl).toContain("/rest/api/3/search/jql");
      expect(capturedUrl).toContain("jql=project");
    });

    it("createIssue sends POST with body", async () => {
      let capturedMethod = "";
      let capturedBody = "";
      const fetcher: typeof fetch = async (_input, init) => {
        capturedMethod = init?.method ?? "GET";
        capturedBody = init?.body as string;
        return new Response(JSON.stringify({ id: "10", key: "PROJ-10" }), { status: 201 });
      };
      const client = new JiraClient(TEST_CONFIG, fetcher);
      await client.createIssue({ fields: { summary: "Test" } });
      expect(capturedMethod).toBe("POST");
      expect(JSON.parse(capturedBody)).toEqual({ fields: { summary: "Test" } });
    });

    it("handles 204 No Content responses", async () => {
      const fetcher: typeof fetch = async () =>
        new Response(null, { status: 204, statusText: "No Content" });
      const client = new JiraClient(TEST_CONFIG, fetcher);
      await client.deleteIssue("PROJ-1"); // should not throw
    });

    it("builds query params correctly", async () => {
      let capturedUrl = "";
      const fetcher: typeof fetch = async (input) => {
        capturedUrl = String(input);
        return new Response(JSON.stringify({ values: [], startAt: 0, maxResults: 10, total: 0 }), {
          status: 200,
        });
      };
      const client = new JiraClient(TEST_CONFIG, fetcher);
      await client.listProjects({ startAt: 0, maxResults: 10 });
      expect(capturedUrl).toContain("startAt=0");
      expect(capturedUrl).toContain("maxResults=10");
    });
  });
});
