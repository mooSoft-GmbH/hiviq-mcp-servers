import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { formatLinkTypes, formatRemoteLinks } from "./formatters.js";

const CreateLinkInput = z.object({
  typeName: z.string().min(1),
  inwardIssueKey: z.string().min(1),
  outwardIssueKey: z.string().min(1),
});

const DeleteLinkInput = z.object({ linkId: z.string().min(1) });

const ListRemoteLinksInput = z.object({ issueIdOrKey: z.string().min(1) });

export async function handleListLinkTypes(
  client: JiraClient,
  _baseUrl: string,
  _args: unknown,
): Promise<ToolResult> {
  const result = await client.listLinkTypes();
  return { content: [{ type: "text", text: formatLinkTypes(result.issueLinkTypes) }] };
}

export async function handleCreateLink(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { typeName, inwardIssueKey, outwardIssueKey } = CreateLinkInput.parse(args);
  await client.createLink({
    type: { name: typeName },
    inwardIssue: { key: inwardIssueKey },
    outwardIssue: { key: outwardIssueKey },
  });
  return {
    content: [
      {
        type: "text",
        text: `Link created: ${inwardIssueKey} ← ${typeName} → ${outwardIssueKey}`,
      },
    ],
  };
}

export async function handleDeleteLink(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { linkId } = DeleteLinkInput.parse(args);
  await client.deleteLink(linkId);
  return { content: [{ type: "text", text: `Link \`${linkId}\` deleted.` }] };
}

export async function handleListRemoteLinks(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey } = ListRemoteLinksInput.parse(args);
  const links = await client.listRemoteLinks(issueIdOrKey);
  return { content: [{ type: "text", text: formatRemoteLinks(links) }] };
}
