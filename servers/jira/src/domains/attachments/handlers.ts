import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { formatAttachmentList } from "./formatters.js";

const ListAttachmentsInput = z.object({
  issueIdOrKey: z.string().min(1),
});

const AddAttachmentInput = z.object({
  issueIdOrKey: z.string().min(1),
  filename: z.string().min(1),
  content: z.string().min(1),
});

export async function handleListAttachments(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey } = ListAttachmentsInput.parse(args);
  const attachments = await client.listAttachments(issueIdOrKey);
  return { content: [{ type: "text", text: formatAttachmentList(attachments) }] };
}

export async function handleAddAttachment(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, filename, content } = AddAttachmentInput.parse(args);
  const attachments = await client.addAttachment(issueIdOrKey, filename, content);
  const count = attachments.length;
  return {
    content: [
      {
        type: "text",
        text: `${count} attachment(s) added to ${issueIdOrKey}:\n\n${formatAttachmentList(attachments)}`,
      },
    ],
  };
}
