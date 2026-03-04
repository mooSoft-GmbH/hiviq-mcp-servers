import { describe, expect, it } from "bun:test";
import { formatSearchResults } from "../../../../src/domains/search/formatters.js";
import type { SearchResponse } from "../../../../src/types.js";

const response: SearchResponse = {
  results: [
    {
      title: "Getting Started",
      excerpt: "Introduction guide",
      url: "/pages/2001",
      lastModified: "2024-03-01T08:00:00.000Z",
      space: { key: "TEAM", name: "Team Space" },
    },
  ],
  totalSize: 1,
  start: 0,
  limit: 25,
};

describe("formatSearchResults", () => {
  it("returns no-results message for empty results", () => {
    const empty: SearchResponse = { ...response, results: [], totalSize: 0 };
    expect(formatSearchResults(empty)).toContain("No results");
  });

  it("includes total count", () => {
    expect(formatSearchResults(response)).toContain("1");
  });

  it("includes result title", () => {
    expect(formatSearchResults(response)).toContain("Getting Started");
  });

  it("includes space key", () => {
    expect(formatSearchResults(response)).toContain("TEAM");
  });

  it("includes excerpt", () => {
    expect(formatSearchResults(response)).toContain("Introduction guide");
  });

  it("includes URL", () => {
    expect(formatSearchResults(response)).toContain("/pages/2001");
  });

  it("numbers results sequentially", () => {
    const twoResults: SearchResponse = {
      ...response,
      results: [response.results[0]!, { ...response.results[0]!, title: "Second", url: "/pages/2002" }],
      totalSize: 2,
    };
    const result = formatSearchResults(twoResults);
    expect(result).toContain("1.");
    expect(result).toContain("2.");
  });
});
