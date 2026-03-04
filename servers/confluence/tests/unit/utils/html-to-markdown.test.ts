import { describe, expect, it } from "bun:test";
import { storageToMarkdown } from "../../../src/utils/html-to-markdown.js";

describe("storageToMarkdown", () => {
  it("returns empty string for empty input", () => {
    expect(storageToMarkdown("")).toBe("");
  });

  it("converts headings", () => {
    expect(storageToMarkdown("<h1>Title</h1>")).toBe("# Title");
    expect(storageToMarkdown("<h2>Sub</h2>")).toBe("## Sub");
    expect(storageToMarkdown("<h3>Deep</h3>")).toBe("### Deep");
  });

  it("converts bold text", () => {
    expect(storageToMarkdown("<strong>bold</strong>")).toBe("**bold**");
    expect(storageToMarkdown("<b>also bold</b>")).toBe("**also bold**");
  });

  it("converts italic text", () => {
    expect(storageToMarkdown("<em>italic</em>")).toBe("*italic*");
    expect(storageToMarkdown("<i>also italic</i>")).toBe("*also italic*");
  });

  it("converts inline code", () => {
    expect(storageToMarkdown("<code>const x = 1</code>")).toBe("`const x = 1`");
  });

  it("converts anchor links", () => {
    expect(storageToMarkdown('<a href="https://example.com">click here</a>')).toBe("[click here](https://example.com)");
  });

  it("converts unordered lists", () => {
    const html = "<ul><li>First</li><li>Second</li></ul>";
    const result = storageToMarkdown(html);
    expect(result).toContain("- First");
    expect(result).toContain("- Second");
  });

  it("converts ordered lists", () => {
    const html = "<ol><li>Alpha</li><li>Beta</li></ol>";
    const result = storageToMarkdown(html);
    expect(result).toContain("1. Alpha");
    expect(result).toContain("2. Beta");
  });

  it("strips remaining HTML tags", () => {
    expect(storageToMarkdown("<div><span>plain text</span></div>")).toBe("plain text");
  });

  it("decodes HTML entities", () => {
    expect(storageToMarkdown("&amp; &lt; &gt; &quot; &#39;")).toBe('& < > " \'');
  });

  it("collapses excessive blank lines", () => {
    const result = storageToMarkdown("<p>line1</p><p>line2</p>");
    expect(result).not.toMatch(/\n{3,}/);
  });

  it("handles mixed content", () => {
    const html = "<h1>Guide</h1><p>This is <strong>important</strong>.</p><ul><li>Item A</li></ul>";
    const result = storageToMarkdown(html);
    expect(result).toContain("# Guide");
    expect(result).toContain("**important**");
    expect(result).toContain("- Item A");
  });

  it("handles code blocks via ac:structured-macro", () => {
    const html = `<ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[const x = 1;]]></ac:plain-text-body></ac:structured-macro>`;
    const result = storageToMarkdown(html);
    expect(result).toContain("```");
    expect(result).toContain("const x = 1;");
  });
});
