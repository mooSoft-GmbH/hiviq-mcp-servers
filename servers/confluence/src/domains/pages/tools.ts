import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const pageTools: Tool[] = [
  {
    name: "list_pages",
    description: "List pages in Confluence, optionally filtered by space, title, or status.",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string", description: "Filter pages by space ID" },
        limit: { type: "number", description: "Max pages to return (1–250, default 25)" },
        status: { type: "string", enum: ["current", "archived", "trashed"], description: "Filter by status" },
        title: { type: "string", description: "Filter by page title (partial match)" },
      },
    },
  },
  {
    name: "get_page",
    description: "Get the full content of a Confluence page, rendered as Markdown.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The page ID" },
      },
      required: ["pageId"],
    },
  },
  {
    name: "get_child_pages",
    description: "List the direct child pages of a given page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The parent page ID" },
        limit: { type: "number", description: "Max results to return (1–250, default 25)" },
      },
      required: ["pageId"],
    },
  },
  {
    name: "get_ancestors",
    description: "Get the ancestor breadcrumb path (parent chain) of a Confluence page.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The page ID" },
      },
      required: ["pageId"],
    },
  },
  {
    name: "create_page",
    description:
      "Create a new Confluence page. Content must be in Confluence storage format (XHTML). Provide parentId to nest the page under a parent.",
    inputSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string", description: "Target space ID" },
        title: { type: "string", description: "Page title" },
        content: { type: "string", description: "Page body in Confluence storage format (XHTML)" },
        parentId: { type: "string", description: "Optional parent page ID" },
        status: { type: "string", enum: ["current", "draft"], description: "Publish status (default: current)" },
      },
      required: ["spaceId", "title", "content"],
    },
  },
  {
    name: "update_page",
    description:
      "Update an existing Confluence page. You must provide the current version number to avoid conflicts.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The page ID to update" },
        title: { type: "string", description: "New page title" },
        content: { type: "string", description: "New page body in Confluence storage format (XHTML)" },
        versionNumber: { type: "number", description: "Current version number of the page (increment will happen server-side)" },
        versionMessage: { type: "string", description: "Optional message describing this change" },
      },
      required: ["pageId", "title", "content", "versionNumber"],
    },
  },
  {
    name: "delete_page",
    description: "Delete a Confluence page by ID. This action is irreversible.",
    inputSchema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "The page ID to delete" },
      },
      required: ["pageId"],
    },
  },
];
