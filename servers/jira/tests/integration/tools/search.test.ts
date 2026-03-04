import { describe, expect, it } from "bun:test";
import { JiraClient } from "../../../src/client/jira.js";
import { handleSearchIssues, handleSearchText } from "../../../src/domains/search/handlers.js";
import issuesFixture from "../../fixtures/issues.json";

const BASE_URL = "https://moosoft.atlassian.net";
const TEST_CONFIG = {
  JIRA_BASE_URL: BASE_URL,
  JIRA_EMAIL: "t@t.com",
  JIRA_API_TOKEN: "tok",
};

function makeClient(fixture: unknown): JiraClient {
  const fetcher: typeof fetch = async () =>
    new Response(JSON.stringify(fixture), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  return new JiraClient(TEST_CONFIG, fetcher);
}

describe("search handlers (integration)", () => {
  it("handleSearchIssues returns formatted results", async () => {
    const client = makeClient(issuesFixture.searchResult);
    const result = await handleSearchIssues(client, BASE_URL, {
      jql: "project = PROJ",
    });
    expect(result.content[0]?.text).toContain("Found 2 issue(s)");
    expect(result.content[0]?.text).toContain("PROJ-1");
    expect(result.content[0]?.text).toContain("PROJ-3");
  });

  it("handleSearchText builds JQL from text", async () => {
    let capturedUrl = "";
    const fetcher: typeof fetch = async (input) => {
      capturedUrl = String(input);
      return new Response(JSON.stringify(issuesFixture.searchResult), { status: 200 });
    };
    const client = new JiraClient(TEST_CONFIG, fetcher);
    await handleSearchText(client, BASE_URL, { text: "authentication" });
    expect(capturedUrl).toContain("authentication");
  });

  it("handleSearchText includes project filter", async () => {
    let capturedUrl = "";
    const fetcher: typeof fetch = async (input) => {
      capturedUrl = String(input);
      return new Response(JSON.stringify(issuesFixture.searchResult), { status: 200 });
    };
    const client = new JiraClient(TEST_CONFIG, fetcher);
    await handleSearchText(client, BASE_URL, {
      text: "auth",
      projectKey: "PROJ",
    });
    expect(capturedUrl).toContain("PROJ");
  });

  it("rejects empty JQL", async () => {
    const client = makeClient({});
    await expect(handleSearchIssues(client, BASE_URL, { jql: "" })).rejects.toThrow();
  });
});
