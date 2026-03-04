import { z } from "zod";
import type { JiraClient } from "../../client/jira.js";
import type { ToolResult } from "../../types.js";
import { formatBoard, formatBoardConfig, formatBoardList } from "./formatters.js";

const ListBoardsInput = z.object({
  startAt: z.number().int().min(0).optional(),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
  type: z.enum(["scrum", "kanban", "simple"]).optional(),
  name: z.string().optional(),
  projectKeyOrId: z.string().optional(),
});

const GetBoardInput = z.object({ boardId: z.number().int() });
const GetBoardConfigInput = z.object({ boardId: z.number().int() });

export async function handleListBoards(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const params = ListBoardsInput.parse(args);
  const result = await client.listBoards(params);
  return { content: [{ type: "text", text: formatBoardList(result.values) }] };
}

export async function handleGetBoard(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { boardId } = GetBoardInput.parse(args);
  const board = await client.getBoard(boardId);
  return { content: [{ type: "text", text: formatBoard(board) }] };
}

export async function handleGetBoardConfiguration(
  client: JiraClient,
  _baseUrl: string,
  args: unknown,
): Promise<ToolResult> {
  const { boardId } = GetBoardConfigInput.parse(args);
  const config = await client.getBoardConfiguration(boardId);
  return { content: [{ type: "text", text: formatBoardConfig(config) }] };
}
