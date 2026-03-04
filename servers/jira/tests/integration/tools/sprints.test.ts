import { describe, expect, it } from "bun:test";
import { JiraClient } from "../../../src/client/jira.js";
import {
  handleListSprints,
  handleGetSprint,
  handleCreateSprint,
} from "../../../src/domains/sprints/handlers.js";
import sprintsFixture from "../../fixtures/sprints.json";

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

describe("sprint handlers (integration)", () => {
  it("handleListSprints returns sprint list", async () => {
    const client = makeClient(sprintsFixture.list);
    const result = await handleListSprints(client, BASE_URL, { boardId: 1 });
    expect(result.content[0]?.text).toContain("Sprint 1");
    expect(result.content[0]?.text).toContain("Sprint 2");
    expect(result.content[0]?.text).toContain("Sprint 3");
    expect(result.content[0]?.text).toContain("active");
  });

  it("handleGetSprint returns sprint detail", async () => {
    const client = makeClient(sprintsFixture.single);
    const result = await handleGetSprint(client, BASE_URL, { sprintId: 2 });
    expect(result.content[0]?.text).toContain("Sprint 2");
    expect(result.content[0]?.text).toContain("active");
    expect(result.content[0]?.text).toContain("Auth & permissions");
  });

  it("handleCreateSprint returns created sprint", async () => {
    const client = makeClient(sprintsFixture.created);
    const result = await handleCreateSprint(client, BASE_URL, {
      name: "Sprint 4",
      originBoardId: 1,
      goal: "Testing sprint",
    });
    expect(result.content[0]?.text).toContain("Sprint 4");
    expect(result.content[0]?.text).toContain("future");
  });

  it("rejects missing boardId", async () => {
    const client = makeClient({});
    await expect(handleListSprints(client, BASE_URL, {})).rejects.toThrow();
  });
});
