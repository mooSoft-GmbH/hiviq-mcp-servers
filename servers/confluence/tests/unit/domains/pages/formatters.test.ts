import { describe, expect, it } from "bun:test";
import { formatAncestors, formatPage, formatPageList } from "../../../../src/domains/pages/formatters.js";
import type { Ancestor, Page } from "../../../../src/types.js";

const BASE_URL = "https://moosoft.atlassian.net";

const page: Page = {
  id: "2001",
  title: "Getting Started",
  spaceId: "1001",
  status: "current",
  createdAt: "2024-01-15T10:00:00.000Z",
  authorId: "user-abc",
  version: { number: 3, createdAt: "2024-03-01T08:00:00.000Z" },
  body: {
    storage: {
      value: "<h1>Welcome</h1><p>Hello <strong>world</strong>.</p>",
      representation: "storage",
    },
  },
  _links: { webui: "/pages/2001" },
};

describe("formatPage", () => {
  it("uses title as heading", () => {
    expect(formatPage(page, BASE_URL)).toContain("# Getting Started");
  });

  it("includes metadata", () => {
    const result = formatPage(page, BASE_URL);
    expect(result).toContain("2001");
    expect(result).toContain("**Version:** 3");
    expect(result).toContain("user-abc");
  });

  it("renders body as markdown", () => {
    const result = formatPage(page, BASE_URL);
    expect(result).toContain("# Welcome");
    expect(result).toContain("**world**");
  });

  it("includes URL", () => {
    expect(formatPage(page, BASE_URL)).toContain(`${BASE_URL}/wiki/pages/2001`);
  });

  it("handles page without body", () => {
    const noBody: Page = { ...page, body: undefined };
    const result = formatPage(noBody, BASE_URL);
    expect(result).toContain("# Getting Started");
    expect(result).not.toContain("---");
  });
});

describe("formatPageList", () => {
  it("returns no-pages message for empty array", () => {
    expect(formatPageList([], BASE_URL)).toBe("No pages found.");
  });

  it("includes count", () => {
    expect(formatPageList([page], BASE_URL)).toContain("1 page");
  });

  it("includes title and ID", () => {
    const result = formatPageList([page], BASE_URL);
    expect(result).toContain("Getting Started");
    expect(result).toContain("2001");
  });
});

describe("formatAncestors", () => {
  it("returns root message for empty array", () => {
    expect(formatAncestors([])).toContain("root page");
  });

  it("formats ancestor breadcrumb", () => {
    const ancestors: Ancestor[] = [
      { id: "1999", title: "Root" },
      { id: "2000", title: "Docs" },
    ];
    const result = formatAncestors(ancestors);
    expect(result).toContain("Root");
    expect(result).toContain("Docs");
    expect(result).toContain(">");
  });
});
