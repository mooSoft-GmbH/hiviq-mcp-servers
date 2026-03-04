import { describe, expect, it } from "bun:test";
import { formatMessage, formatPermalink, formatPostedMessage, formatScheduledMessage } from "../../../../src/domains/messaging/formatters.js";

describe("formatPostedMessage", () => {
  it("includes channel and timestamp", () => {
    const result = formatPostedMessage("1711480000.123456", "C001");
    expect(result).toContain("C001");
    expect(result).toContain("1711480000.123456");
  });
  it("includes human-readable time", () => {
    expect(formatPostedMessage("1711480000.0", "C001")).toContain("UTC");
  });
});

describe("formatScheduledMessage", () => {
  it("includes ID, channel, and time", () => {
    const result = formatScheduledMessage("Q123", "C001", 1800000000);
    expect(result).toContain("Q123");
    expect(result).toContain("C001");
    expect(result).toContain("UTC");
  });
});

describe("formatPermalink", () => {
  it("includes the URL", () => {
    const result = formatPermalink("https://slack.com/archives/C001/p123", "C001");
    expect(result).toContain("https://slack.com");
    expect(result).toContain("C001");
  });
});

describe("formatMessage", () => {
  it("shows username and text", () => {
    const result = formatMessage({ ts: "1711480000.0", user: "U001", text: "Hello!" });
    expect(result).toContain("U001");
    expect(result).toContain("Hello!");
  });
  it("shows no text placeholder when empty", () => {
    expect(formatMessage({ ts: "1711480000.0" })).toContain("no text");
  });
  it("shows reply count when present", () => {
    expect(formatMessage({ ts: "1711480000.0", reply_count: 3 })).toContain("3 replies");
  });
  it("decodes Slack mentions in text", () => {
    expect(formatMessage({ ts: "1711480000.0", text: "Hey <@U001>!" })).toContain("@U001");
  });
});
