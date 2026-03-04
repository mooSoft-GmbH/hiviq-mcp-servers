import { z } from "zod";
import type { ConfluenceClient } from "../../client/confluence.js";
import type { ToolResult } from "../../types.js";
import { formatAncestors, formatPage, formatPageList } from "./formatters.js";

export const ListPagesInput = z.object({
  spaceId: z.string().optional(),
  limit: z.number().int().min(1).max(250).optional().default(25),
  status: z.enum(["current", "archived", "trashed"]).optional(),
  title: z.string().optional(),
});

export const GetPageInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
});

export const GetChildPagesInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
  limit: z.number().int().min(1).max(250).optional().default(25),
});

export const GetAncestorsInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
});

export const CreatePageInput = z.object({
  spaceId: z.string().min(1, "spaceId is required"),
  title: z.string().min(1, "title is required"),
  content: z.string().min(1, "content (Confluence storage format HTML) is required"),
  parentId: z.string().optional(),
  status: z.enum(["current", "draft"]).optional().default("current"),
});

export const UpdatePageInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
  title: z.string().min(1, "title is required"),
  content: z.string().min(1, "content (Confluence storage format HTML) is required"),
  versionNumber: z.number().int().min(1, "versionNumber of the current page is required"),
  versionMessage: z.string().optional(),
});

export const DeletePageInput = z.object({
  pageId: z.string().min(1, "pageId is required"),
});

export async function handleListPages(client: ConfluenceClient, baseUrl: string, args: unknown): Promise<ToolResult> {
  const { spaceId, limit, status, title } = ListPagesInput.parse(args);
  const response = await client.listPages({ spaceId, limit, status, title });
  return { content: [{ type: "text", text: formatPageList(response.results, baseUrl) }] };
}

export async function handleGetPage(client: ConfluenceClient, baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId } = GetPageInput.parse(args);
  const page = await client.getPage(pageId);
  return { content: [{ type: "text", text: formatPage(page, baseUrl) }] };
}

export async function handleGetChildPages(client: ConfluenceClient, baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId, limit } = GetChildPagesInput.parse(args);
  const response = await client.getChildPages(pageId, { limit });
  return { content: [{ type: "text", text: formatPageList(response.results, baseUrl) }] };
}

export async function handleGetAncestors(client: ConfluenceClient, _baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId } = GetAncestorsInput.parse(args);
  const response = await client.getAncestors(pageId);
  return { content: [{ type: "text", text: formatAncestors(response.results) }] };
}

export async function handleCreatePage(client: ConfluenceClient, baseUrl: string, args: unknown): Promise<ToolResult> {
  const { spaceId, title, content, parentId, status } = CreatePageInput.parse(args);
  const page = await client.createPage({
    spaceId,
    title,
    parentId,
    status,
    body: { representation: "storage", value: content },
  });
  return {
    content: [
      {
        type: "text",
        text: `Page created successfully!\n\n**Title:** ${page.title}\n**ID:** ${page.id}\n**URL:** ${baseUrl}/wiki${page._links?.webui ?? ""}`,
      },
    ],
  };
}

export async function handleUpdatePage(client: ConfluenceClient, baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId, title, content, versionNumber, versionMessage } = UpdatePageInput.parse(args);
  const page = await client.updatePage(pageId, {
    id: pageId,
    title,
    version: { number: versionNumber, message: versionMessage },
    body: { representation: "storage", value: content },
  });
  return {
    content: [
      {
        type: "text",
        text: `Page updated successfully!\n\n**Title:** ${page.title}\n**ID:** ${page.id}\n**Version:** ${page.version.number}\n**URL:** ${baseUrl}/wiki${page._links?.webui ?? ""}`,
      },
    ],
  };
}

export async function handleDeletePage(client: ConfluenceClient, _baseUrl: string, args: unknown): Promise<ToolResult> {
  const { pageId } = DeletePageInput.parse(args);
  await client.deletePage(pageId);
  return { content: [{ type: "text", text: `Page ${pageId} deleted successfully.` }] };
}
