import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const searchTools: Tool[] = [
  {
    name: "search",
    description:
      "Search Confluence using CQL (Confluence Query Language). Example: `type = page AND space.key = \"TEAM\" AND text ~ \"deployment\"`.",
    inputSchema: {
      type: "object",
      properties: {
        cql: { type: "string", description: "CQL query string" },
        limit: { type: "number", description: "Max results (1–100, default 25)" },
        start: { type: "number", description: "Pagination offset (default 0)" },
        excerpt: { type: "string", enum: ["indexed", "highlight", "none"], description: "Excerpt format" },
      },
      required: ["cql"],
    },
  },
  {
    name: "search_text",
    description: "Full-text search across Confluence with optional space and content type filters.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Free-text search query" },
        spaceKey: { type: "string", description: "Restrict search to this space key" },
        type: { type: "string", enum: ["page", "blogpost", "comment", "attachment"], description: "Content type filter" },
        limit: { type: "number", description: "Max results (1–100, default 25)" },
      },
      required: ["text"],
    },
  },
];
