import { describe, expect, it } from "bun:test";
import { decodeSlackText, formatBytes, formatTs, truncate } from "../../../src/utils/format.js";

describe("decodeSlackText", () => {
  it("decodes user mentions", () => expect(decodeSlackText("<@U123456>")).toBe("@U123456"));
  it("decodes channel mentions", () => expect(decodeSlackText("<#C123|general>")).toBe("#general"));
  it("decodes links with label", () => expect(decodeSlackText("<https://x.com|click>")).toBe("click (https://x.com)"));
  it("decodes bare links", () => expect(decodeSlackText("<https://x.com>")).toBe("https://x.com"));
  it("decodes HTML entities", () => expect(decodeSlackText("a &amp; b &lt;c&gt;")).toBe("a & b <c>"));
  it("returns plain text unchanged", () => expect(decodeSlackText("hello world")).toBe("hello world"));
});

describe("formatTs", () => {
  it("converts Slack timestamp to UTC string", () => {
    const result = formatTs("1711480000.000000");
    expect(result).toContain("UTC");
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

describe("formatBytes", () => {
  it("formats bytes", () => expect(formatBytes(512)).toBe("512 B"));
  it("formats kilobytes", () => expect(formatBytes(2048)).toBe("2.0 KB"));
  it("formats megabytes", () => expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB"));
});

describe("truncate", () => {
  it("returns short text unchanged", () => expect(truncate("hello", 10)).toBe("hello"));
  it("truncates long text with ellipsis", () => {
    const result = truncate("a".repeat(300), 200);
    expect(result).toHaveLength(201); // 200 + ellipsis char
    expect(result).toEndWith("…");
  });
});
