import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { textToAdf } from "../../utils/adf.js";
import { formatComment, formatCommentList } from "./formatters.js";

const ListCommentsInput = z.object({
  issueIdOrKey: z.string().min(1),
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
  orderBy: z.enum(["created", "-created"]).optional(),
});

const AddCommentInput = z.object({
  issueIdOrKey: z.string().min(1),
  body: z.string().min(1),
});

const UpdateCommentInput = z.object({
  issueIdOrKey: z.string().min(1),
  commentId: z.string().min(1),
  body: z.string().min(1),
});

const DeleteCommentInput = z.object({
  issueIdOrKey: z.string().min(1),
  commentId: z.string().min(1),
});

export async function handleListComments(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, startAt, maxResults, orderBy } = ListCommentsInput.parse(args);
  const result = await client.listComments(issueIdOrKey, { startAt, maxResults, orderBy });
  return {
    content: [{ type: "text", text: formatCommentList(result.comments, result.total) }],
  };
}

export async function handleAddComment(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, body } = AddCommentInput.parse(args);
  const comment = await client.addComment(issueIdOrKey, textToAdf(body));
  return {
    content: [
      { type: "text", text: `Comment added to ${issueIdOrKey}:\n\n${formatComment(comment)}` },
    ],
  };
}

export async function handleUpdateComment(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, commentId, body } = UpdateCommentInput.parse(args);
  const comment = await client.updateComment(issueIdOrKey, commentId, textToAdf(body));
  return {
    content: [
      { type: "text", text: `Comment ${commentId} updated:\n\n${formatComment(comment)}` },
    ],
  };
}

export async function handleDeleteComment(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { issueIdOrKey, commentId } = DeleteCommentInput.parse(args);
  await client.deleteComment(issueIdOrKey, commentId);
  return {
    content: [{ type: "text", text: `Comment ${commentId} deleted from ${issueIdOrKey}.` }],
  };
}
