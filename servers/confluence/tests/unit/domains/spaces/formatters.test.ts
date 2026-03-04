import { describe, expect, it } from "bun:test";
import { formatSpace, formatSpaceList } from "../../../../src/domains/spaces/formatters.js";
import type { Space } from "../../../../src/types.js";

const BASE_URL = "https://moosoft.atlassian.net";

const space: Space = {
  id: "1001",
  key: "TEAM",
  name: "Team Space",
  type: "global",
  status: "current",
  description: { plain: { value: "Our workspace" } },
  _links: { webui: "/spaces/TEAM" },
};

describe("formatSpace", () => {
  it("includes name as heading", () => {
    expect(formatSpace(space, BASE_URL)).toContain("# Team Space");
  });

  it("includes key, id, type, status", () => {
    const result = formatSpace(space, BASE_URL);
    expect(result).toContain("TEAM");
    expect(result).toContain("1001");
    expect(result).toContain("global");
    expect(result).toContain("current");
  });

  it("includes description when present", () => {
    expect(formatSpace(space, BASE_URL)).toContain("Our workspace");
  });

  it("includes web URL when link present", () => {
    expect(formatSpace(space, BASE_URL)).toContain(`${BASE_URL}/wiki/spaces/TEAM`);
  });

  it("omits description section when absent", () => {
    const noDesc: Space = { ...space, description: undefined };
    expect(formatSpace(noDesc, BASE_URL)).not.toContain("Our workspace");
  });
});

describe("formatSpaceList", () => {
  it("returns no-spaces message for empty array", () => {
    expect(formatSpaceList([], BASE_URL)).toBe("No spaces found.");
  });

  it("includes count in header", () => {
    expect(formatSpaceList([space], BASE_URL)).toContain("1 space");
  });

  it("includes space name and key", () => {
    const result = formatSpaceList([space], BASE_URL);
    expect(result).toContain("Team Space");
    expect(result).toContain("TEAM");
  });

  it("formats multiple spaces", () => {
    const second: Space = { ...space, id: "1002", key: "ARCH", name: "Architecture" };
    const result = formatSpaceList([space, second], BASE_URL);
    expect(result).toContain("2 space");
    expect(result).toContain("Architecture");
  });
});
