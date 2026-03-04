import { describe, expect, it } from "bun:test";
import { ConfluenceClient } from "../../../src/client/confluence.js";
import { handleAddComment, handleListComments } from "../../../src/domains/comments/handlers.js";
import { handleListAttachments } from "../../../src/domains/attachments/handlers.js";
import { handleAddLabel, handleListLabels, handleRemoveLabel } from "../../../src/domains/labels/handlers.js";
import { handleGetBlogPost, handleListBlogPosts } from "../../../src/domains/blog-posts/handlers.js";
import commentsFixture from "../../fixtures/comments.json";
import attachmentsFixture from "../../fixtures/attachments.json";
import labelsFixture from "../../fixtures/labels.json";
import blogPostsFixture from "../../fixtures/blog-posts.json";

const BASE_URL = "https://moosoft.atlassian.net";

function makeClient(fixture: unknown): ConfluenceClient {
  const fetcher: typeof fetch = async () =>
    new Response(JSON.stringify(fixture), { status: 200, headers: { "Content-Type": "application/json" } });
  return new ConfluenceClient(
    { CONFLUENCE_BASE_URL: BASE_URL, CONFLUENCE_EMAIL: "t@t.com", CONFLUENCE_API_TOKEN: "tok" },
    fetcher,
  );
}

describe("handleListComments (integration)", () => {
  it("returns formatted comments", async () => {
    const client = makeClient(commentsFixture.list);
    const result = await handleListComments(client, BASE_URL, { pageId: "2001" });
    expect(result.content[0]?.text).toContain("1 comment");
    expect(result.content[0]?.text).toContain("3001");
  });

  it("rejects missing pageId", async () => {
    const client = makeClient(commentsFixture.list);
    await expect(handleListComments(client, BASE_URL, {})).rejects.toThrow();
  });
});

describe("handleAddComment (integration)", () => {
  it("returns success with comment ID", async () => {
    const client = makeClient(commentsFixture.created);
    const result = await handleAddComment(client, BASE_URL, { pageId: "2001", content: "<p>Nice!</p>" });
    expect(result.content[0]?.text).toContain("3002");
  });
});

describe("handleListLabels (integration)", () => {
  it("returns label list", async () => {
    const client = makeClient(labelsFixture.list);
    const result = await handleListLabels(client, BASE_URL, { pageId: "2001" });
    expect(result.content[0]?.text).toContain("documentation");
    expect(result.content[0]?.text).toContain("team");
  });
});

describe("handleAddLabel (integration)", () => {
  it("returns updated label list", async () => {
    const client = makeClient(labelsFixture.after_add);
    const result = await handleAddLabel(client, BASE_URL, { pageId: "2001", name: "new-label" });
    expect(result.content[0]?.text).toContain("new-label");
  });
});

describe("handleRemoveLabel (integration)", () => {
  it("returns confirmation message", async () => {
    const fetcher: typeof fetch = async () => new Response(null, { status: 204 });
    const client = new ConfluenceClient(
      { CONFLUENCE_BASE_URL: BASE_URL, CONFLUENCE_EMAIL: "t@t.com", CONFLUENCE_API_TOKEN: "tok" },
      fetcher,
    );
    const result = await handleRemoveLabel(client, BASE_URL, { pageId: "2001", name: "documentation" });
    expect(result.content[0]?.text).toContain("removed");
  });
});

describe("handleListAttachments (integration)", () => {
  it("returns formatted attachment list", async () => {
    const client = makeClient(attachmentsFixture.list);
    const result = await handleListAttachments(client, BASE_URL, { pageId: "2001" });
    expect(result.content[0]?.text).toContain("architecture-diagram.png");
    expect(result.content[0]?.text).toContain("240.0 KB");
    expect(result.content[0]?.text).toContain("1.0 MB");
  });
});

describe("handleListBlogPosts (integration)", () => {
  it("returns formatted blog post list", async () => {
    const client = makeClient(blogPostsFixture.list);
    const result = await handleListBlogPosts(client, BASE_URL, {});
    expect(result.content[0]?.text).toContain("Q1 Engineering Update");
  });
});

describe("handleGetBlogPost (integration)", () => {
  it("renders blog post body as markdown", async () => {
    const client = makeClient(blogPostsFixture.single);
    const result = await handleGetBlogPost(client, BASE_URL, { blogPostId: "6001" });
    expect(result.content[0]?.text).toContain("## Highlights");
    expect(result.content[0]?.text).toContain("**3 major features**");
  });
});
