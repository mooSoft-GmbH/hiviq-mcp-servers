import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ZodError } from "zod";
import type { ConfluenceClient } from "./client/confluence.js";
import { handleAddComment, handleListComments } from "./domains/comments/handlers.js";
import { commentTools } from "./domains/comments/tools.js";
import { handleListAttachments } from "./domains/attachments/handlers.js";
import { attachmentTools } from "./domains/attachments/tools.js";
import { handleAddLabel, handleListLabels, handleRemoveLabel } from "./domains/labels/handlers.js";
import { labelTools } from "./domains/labels/tools.js";
import { handleGetBlogPost, handleListBlogPosts } from "./domains/blog-posts/handlers.js";
import { blogPostTools } from "./domains/blog-posts/tools.js";
import {
  handleCreatePage,
  handleDeletePage,
  handleGetAncestors,
  handleGetChildPages,
  handleGetPage,
  handleListPages,
  handleUpdatePage,
} from "./domains/pages/handlers.js";
import { pageTools } from "./domains/pages/tools.js";
import { handleSearch, handleSearchText } from "./domains/search/handlers.js";
import { searchTools } from "./domains/search/tools.js";
import { handleGetSpace, handleListSpaces } from "./domains/spaces/handlers.js";
import { spaceTools } from "./domains/spaces/tools.js";
import type { ToolResult } from "./types.js";

const ALL_TOOLS = [
  ...spaceTools,
  ...pageTools,
  ...searchTools,
  ...commentTools,
  ...labelTools,
  ...attachmentTools,
  ...blogPostTools,
];

type Handler = (client: ConfluenceClient, baseUrl: string, args: unknown) => Promise<ToolResult>;

function buildHandlerMap(client: ConfluenceClient, baseUrl: string): Map<string, () => Promise<ToolResult>> {
  const bind = (h: Handler, args: unknown) => () => h(client, baseUrl, args);

  return new Map([
    ["list_spaces", (args: unknown) => bind(handleListSpaces, args)()],
    ["get_space", (args: unknown) => bind(handleGetSpace, args)()],
    ["list_pages", (args: unknown) => bind(handleListPages, args)()],
    ["get_page", (args: unknown) => bind(handleGetPage, args)()],
    ["get_child_pages", (args: unknown) => bind(handleGetChildPages, args)()],
    ["get_ancestors", (args: unknown) => bind(handleGetAncestors, args)()],
    ["create_page", (args: unknown) => bind(handleCreatePage, args)()],
    ["update_page", (args: unknown) => bind(handleUpdatePage, args)()],
    ["delete_page", (args: unknown) => bind(handleDeletePage, args)()],
    ["search", (args: unknown) => bind(handleSearch, args)()],
    ["search_text", (args: unknown) => bind(handleSearchText, args)()],
    ["list_comments", (args: unknown) => bind(handleListComments, args)()],
    ["add_comment", (args: unknown) => bind(handleAddComment, args)()],
    ["list_labels", (args: unknown) => bind(handleListLabels, args)()],
    ["add_label", (args: unknown) => bind(handleAddLabel, args)()],
    ["remove_label", (args: unknown) => bind(handleRemoveLabel, args)()],
    ["list_attachments", (args: unknown) => bind(handleListAttachments, args)()],
    ["list_blog_posts", (args: unknown) => bind(handleListBlogPosts, args)()],
    ["get_blog_post", (args: unknown) => bind(handleGetBlogPost, args)()],
  ] as unknown as [string, () => Promise<ToolResult>][]);
}

export function createServer(client: ConfluenceClient, baseUrl: string): Server {
  const server = new Server(
    { name: "hiviq-confluence", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: ALL_TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handlers: Record<string, (args: unknown) => Promise<ToolResult>> = {
      list_spaces: (a) => handleListSpaces(client, baseUrl, a),
      get_space: (a) => handleGetSpace(client, baseUrl, a),
      list_pages: (a) => handleListPages(client, baseUrl, a),
      get_page: (a) => handleGetPage(client, baseUrl, a),
      get_child_pages: (a) => handleGetChildPages(client, baseUrl, a),
      get_ancestors: (a) => handleGetAncestors(client, baseUrl, a),
      create_page: (a) => handleCreatePage(client, baseUrl, a),
      update_page: (a) => handleUpdatePage(client, baseUrl, a),
      delete_page: (a) => handleDeletePage(client, baseUrl, a),
      search: (a) => handleSearch(client, baseUrl, a),
      search_text: (a) => handleSearchText(client, baseUrl, a),
      list_comments: (a) => handleListComments(client, baseUrl, a),
      add_comment: (a) => handleAddComment(client, baseUrl, a),
      list_labels: (a) => handleListLabels(client, baseUrl, a),
      add_label: (a) => handleAddLabel(client, baseUrl, a),
      remove_label: (a) => handleRemoveLabel(client, baseUrl, a),
      list_attachments: (a) => handleListAttachments(client, baseUrl, a),
      list_blog_posts: (a) => handleListBlogPosts(client, baseUrl, a),
      get_blog_post: (a) => handleGetBlogPost(client, baseUrl, a),
    };

    const handler = handlers[name];
    if (!handler) {
      return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }

    try {
      return await handler(args);
    } catch (err) {
      if (err instanceof ZodError) {
        const msg = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
        return { content: [{ type: "text", text: `Invalid arguments: ${msg}` }], isError: true };
      }
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  });

  return server;
}
