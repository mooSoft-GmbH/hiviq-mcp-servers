import { describe, expect, it } from "bun:test";
import { formatIssue, formatIssueList, formatTransitions } from "../../src/domains/issues/formatters.js";
import { formatSearchResults } from "../../src/domains/search/formatters.js";
import { formatProject, formatProjectList } from "../../src/domains/projects/formatters.js";
import { formatSprintList } from "../../src/domains/sprints/formatters.js";
import { formatBoardList } from "../../src/domains/boards/formatters.js";
import issuesFixture from "../fixtures/issues.json";
import projectsFixture from "../fixtures/projects.json";
import sprintsFixture from "../fixtures/sprints.json";
import boardsFixture from "../fixtures/boards.json";

const BASE_URL = "https://moosoft.atlassian.net";

describe("issue formatters", () => {
  it("formats a single issue with all fields", () => {
    const result = formatIssue(issuesFixture.single as any, BASE_URL);
    expect(result).toContain("PROJ-1");
    expect(result).toContain("Implement user authentication");
    expect(result).toContain("In Progress");
    expect(result).toContain("High");
    expect(result).toContain("Moritz Wilfer");
    expect(result).toContain("backend");
    expect(result).toContain("security");
    expect(result).toContain("API");
    expect(result).toContain("1.0.0");
    expect(result).toContain(`${BASE_URL}/browse/PROJ-1`);
    expect(result).toContain("OAuth 2.0");
    expect(result).toContain("Sub-tasks");
    expect(result).toContain("PROJ-2");
    expect(result).toContain("Links");
    expect(result).toContain("blocks");
    expect(result).toContain("PROJ-3");
  });

  it("formats issue list", () => {
    const result = formatIssueList(issuesFixture.searchResult.issues as any, BASE_URL, 2);
    expect(result).toContain("Found 2 issue(s)");
    expect(result).toContain("PROJ-1");
    expect(result).toContain("PROJ-3");
    expect(result).toContain("Unassigned");
  });

  it("handles empty issue list", () => {
    expect(formatIssueList([], BASE_URL)).toBe("No issues found.");
  });

  it("formats transitions", () => {
    const result = formatTransitions(issuesFixture.transitions.transitions as any);
    expect(result).toContain("To Do");
    expect(result).toContain("In Progress");
    expect(result).toContain("Done");
    expect(result).toContain("11");
    expect(result).toContain("21");
    expect(result).toContain("31");
  });
});

describe("search formatters", () => {
  it("formats search results with type info", () => {
    const result = formatSearchResults(
      issuesFixture.searchResult.issues as any,
      2,
      BASE_URL,
    );
    expect(result).toContain("Story");
    expect(result).toContain("Task");
    expect(result).toContain("High");
    expect(result).toContain("Medium");
  });
});

describe("project formatters", () => {
  it("formats project detail", () => {
    const result = formatProject(projectsFixture.single as any, BASE_URL);
    expect(result).toContain("My Project");
    expect(result).toContain("PROJ");
    expect(result).toContain("software");
    expect(result).toContain("Moritz Wilfer");
  });

  it("formats project list", () => {
    const result = formatProjectList(projectsFixture.list.values as any, 2, BASE_URL);
    expect(result).toContain("Found 2 project(s)");
    expect(result).toContain("My Project");
    expect(result).toContain("Operations");
  });
});

describe("sprint formatters", () => {
  it("formats sprint list", () => {
    const result = formatSprintList(sprintsFixture.list.values as any);
    expect(result).toContain("Sprint 1");
    expect(result).toContain("Sprint 2");
    expect(result).toContain("Sprint 3");
    expect(result).toContain("closed");
    expect(result).toContain("active");
    expect(result).toContain("future");
  });
});

describe("board formatters", () => {
  it("formats board list", () => {
    const result = formatBoardList(boardsFixture.list.values as any);
    expect(result).toContain("PROJ Board");
    expect(result).toContain("OPS Kanban");
    expect(result).toContain("scrum");
    expect(result).toContain("kanban");
  });
});
