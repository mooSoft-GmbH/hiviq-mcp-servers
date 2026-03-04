import { describe, expect, it } from "bun:test";
import { JiraClient } from "../../../src/client/jira.js";
import {
  handleListComments,
  handleAddComment,
  handleDeleteComment,
} from "../../../src/domains/comments/handlers.js";
import commentsFixture from "../../fixtures/comments.json";

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

describe("comment handlers (integration)", () => {
  it("handleListComments returns formatted comments", async () => {
    const client = makeClient(commentsFixture.list);
    const result = await handleListComments(client, BASE_URL, { issueIdOrKey: "PROJ-1" });
    expect(result.content[0]?.text).toContain("2 comment(s)");
    expect(result.content[0]?.text).toContain("Moritz Wilfer");
    expect(result.content[0]?.text).toContain("Started working on this.");
    expect(result.content[0]?.text).toContain("Jane Doe");
  });

  it("handleAddComment returns new comment", async () => {
    const client = makeClient(commentsFixture.created);
    const result = await handleAddComment(client, BASE_URL, {
      issueIdOrKey: "PROJ-1",
      body: "New comment",
    });
    expect(result.content[0]?.text).toContain("Comment added");
    expect(result.content[0]?.text).toContain("Moritz Wilfer");
  });

  it("handleDeleteComment succeeds", async () => {
    const fetcher: typeof fetch = async () => new Response(null, { status: 204 });
    const client = new JiraClient(TEST_CONFIG, fetcher);
    const result = await handleDeleteComment(client, BASE_URL, {
      issueIdOrKey: "PROJ-1",
      commentId: "10100",
    });
    expect(result.content[0]?.text).toContain("deleted");
  });

  it("rejects missing issueIdOrKey", async () => {
    const client = makeClient({});
    await expect(handleListComments(client, BASE_URL, {})).rejects.toThrow();
  });
});
