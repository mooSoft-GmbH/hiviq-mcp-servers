import { describe, expect, it } from "bun:test";
import { JiraClient } from "../../../src/client/jira.js";
import {
  handleGetIssue,
  handleCreateIssue,
  handleGetTransitions,
  handleListIssueTypes,
  handleBulkGetIssues,
} from "../../../src/domains/issues/handlers.js";
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

describe("issue handlers (integration)", () => {
  it("handleGetIssue returns formatted issue", async () => {
    const client = makeClient(issuesFixture.single);
    const result = await handleGetIssue(client, BASE_URL, { issueIdOrKey: "PROJ-1" });
    expect(result.content[0]?.text).toContain("PROJ-1");
    expect(result.content[0]?.text).toContain("Implement user authentication");
    expect(result.content[0]?.text).toContain("In Progress");
  });

  it("handleCreateIssue returns key and URL", async () => {
    const client = makeClient(issuesFixture.created);
    const result = await handleCreateIssue(client, BASE_URL, {
      projectKey: "PROJ",
      issueType: "Task",
      summary: "New task",
    });
    expect(result.content[0]?.text).toContain("PROJ-10");
    expect(result.content[0]?.text).toContain(`${BASE_URL}/browse/PROJ-10`);
  });

  it("handleGetTransitions returns formatted transitions", async () => {
    const client = makeClient(issuesFixture.transitions);
    const result = await handleGetTransitions(client, BASE_URL, { issueIdOrKey: "PROJ-1" });
    expect(result.content[0]?.text).toContain("To Do");
    expect(result.content[0]?.text).toContain("In Progress");
    expect(result.content[0]?.text).toContain("Done");
  });

  it("handleListIssueTypes returns types", async () => {
    const client = makeClient(issuesFixture.issueTypes);
    const result = await handleListIssueTypes(client, BASE_URL, {});
    expect(result.content[0]?.text).toContain("Story");
    expect(result.content[0]?.text).toContain("Bug");
    expect(result.content[0]?.text).toContain("Sub-task");
  });

  it("handleBulkGetIssues returns issue list", async () => {
    const client = makeClient(issuesFixture.searchResult);
    const result = await handleBulkGetIssues(client, BASE_URL, {
      issueIdsOrKeys: ["PROJ-1", "PROJ-3"],
    });
    expect(result.content[0]?.text).toContain("PROJ-1");
    expect(result.content[0]?.text).toContain("PROJ-3");
  });

  it("rejects missing required fields", async () => {
    const client = makeClient({});
    await expect(handleGetIssue(client, BASE_URL, {})).rejects.toThrow();
  });

  it("rejects invalid issueIdOrKey", async () => {
    const client = makeClient({});
    await expect(handleGetIssue(client, BASE_URL, { issueIdOrKey: "" })).rejects.toThrow();
  });
});
