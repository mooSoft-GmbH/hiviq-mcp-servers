import { describe, expect, it } from "bun:test";
import { adfToMarkdown, textToAdf } from "../../src/utils/adf.js";
import type { AdfDocument } from "../../src/types.js";

describe("adfToMarkdown", () => {
  it("converts simple paragraph", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello world" }],
        },
      ],
    };
    expect(adfToMarkdown(doc)).toBe("Hello world");
  });

  it("converts headings", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Section Title" }],
        },
      ],
    };
    expect(adfToMarkdown(doc)).toBe("## Section Title");
  });

  it("converts bold and italic marks", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "bold", marks: [{ type: "strong" }] },
            { type: "text", text: " and " },
            { type: "text", text: "italic", marks: [{ type: "em" }] },
          ],
        },
      ],
    };
    expect(adfToMarkdown(doc)).toBe("**bold** and *italic*");
  });

  it("converts inline code", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Use " },
            { type: "text", text: "const", marks: [{ type: "code" }] },
          ],
        },
      ],
    };
    expect(adfToMarkdown(doc)).toBe("Use `const`");
  });

  it("converts code blocks", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "codeBlock",
          attrs: { language: "typescript" },
          content: [{ type: "text", text: "const x = 1;" }],
        },
      ],
    };
    expect(adfToMarkdown(doc)).toBe("```typescript\nconst x = 1;\n```");
  });

  it("converts bullet lists", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "Item 1" }] },
              ],
            },
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "Item 2" }] },
              ],
            },
          ],
        },
      ],
    };
    const result = adfToMarkdown(doc);
    expect(result).toContain("- Item 1");
    expect(result).toContain("- Item 2");
  });

  it("converts links", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Click here",
              marks: [{ type: "link", attrs: { href: "https://example.com" } }],
            },
          ],
        },
      ],
    };
    expect(adfToMarkdown(doc)).toBe("[Click here](https://example.com)");
  });

  it("converts blockquotes", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "A quote" }] },
          ],
        },
      ],
    };
    expect(adfToMarkdown(doc)).toContain("> A quote");
  });

  it("converts horizontal rule", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [{ type: "rule" }],
    };
    expect(adfToMarkdown(doc)).toBe("---");
  });

  it("handles null/undefined input", () => {
    expect(adfToMarkdown(null)).toBe("");
    expect(adfToMarkdown(undefined)).toBe("");
  });

  it("converts strikethrough", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "deleted", marks: [{ type: "strike" }] },
          ],
        },
      ],
    };
    expect(adfToMarkdown(doc)).toBe("~~deleted~~");
  });

  it("converts mentions", () => {
    const doc: AdfDocument = {
      version: 1,
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "mention", attrs: { text: "@John" } },
          ],
        },
      ],
    };
    expect(adfToMarkdown(doc)).toBe("@John");
  });
});

describe("textToAdf", () => {
  it("converts plain text to ADF document", () => {
    const doc = textToAdf("Hello world");
    expect(doc.type).toBe("doc");
    expect(doc.version).toBe(1);
    expect(doc.content).toHaveLength(1);
    expect(doc.content[0]?.type).toBe("paragraph");
    expect(doc.content[0]?.content?.[0]?.text).toBe("Hello world");
  });

  it("splits on double newlines into paragraphs", () => {
    const doc = textToAdf("First paragraph\n\nSecond paragraph");
    expect(doc.content).toHaveLength(2);
    expect(doc.content[0]?.content?.[0]?.text).toBe("First paragraph");
    expect(doc.content[1]?.content?.[0]?.text).toBe("Second paragraph");
  });
});
