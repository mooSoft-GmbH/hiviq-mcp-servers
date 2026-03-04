import { describe, expect, it } from "bun:test";
import { JiraClient } from "../../../src/client/jira.js";
import {
  handleListProjects,
  handleGetProject,
  handleListProjectComponents,
  handleListProjectVersions,
} from "../../../src/domains/projects/handlers.js";
import projectsFixture from "../../fixtures/projects.json";

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

describe("project handlers (integration)", () => {
  it("handleListProjects returns project list", async () => {
    const client = makeClient(projectsFixture.list);
    const result = await handleListProjects(client, BASE_URL, {});
    expect(result.content[0]?.text).toContain("Found 2 project(s)");
    expect(result.content[0]?.text).toContain("My Project");
    expect(result.content[0]?.text).toContain("Operations");
  });

  it("handleGetProject returns project detail", async () => {
    const client = makeClient(projectsFixture.single);
    const result = await handleGetProject(client, BASE_URL, { projectIdOrKey: "PROJ" });
    expect(result.content[0]?.text).toContain("My Project");
    expect(result.content[0]?.text).toContain("PROJ");
    expect(result.content[0]?.text).toContain("software");
  });

  it("handleListProjectComponents returns components", async () => {
    const client = makeClient(projectsFixture.components);
    const result = await handleListProjectComponents(client, BASE_URL, {
      projectIdOrKey: "PROJ",
    });
    expect(result.content[0]?.text).toContain("API");
    expect(result.content[0]?.text).toContain("Frontend");
  });

  it("handleListProjectVersions returns versions", async () => {
    const client = makeClient(projectsFixture.versions);
    const result = await handleListProjectVersions(client, BASE_URL, {
      projectIdOrKey: "PROJ",
    });
    expect(result.content[0]?.text).toContain("1.0.0");
    expect(result.content[0]?.text).toContain("0.9.0");
    expect(result.content[0]?.text).toContain("Released");
    expect(result.content[0]?.text).toContain("Unreleased");
  });
});
