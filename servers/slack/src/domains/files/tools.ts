import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const fileTools: Tool[] = [
  {
    name: "list_files",
    description: "List files shared in a Slack workspace, optionally filtered by channel, user, or type.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Filter by channel ID" },
        user: { type: "string", description: "Filter by user ID" },
        types: { type: "string", description: "Comma-separated file types: all, spaces, snippets, images, gdocs, zips, pdfs" },
        count: { type: "number", description: "Files per page (default 20)" },
        page: { type: "number", description: "Page number (1-based)" },
      },
    },
  },
  {
    name: "get_file_info",
    description: "Get detailed information about a specific Slack file.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string", description: "File ID (e.g. F123456)" },
      },
      required: ["file"],
    },
  },
  {
    name: "upload_file",
    description: "Upload a text/code snippet or file content to one or more Slack channels.",
    inputSchema: {
      type: "object",
      properties: {
        channels: { type: "string", description: "Comma-separated channel IDs to share the file to" },
        content: { type: "string", description: "File content (text/code)" },
        filename: { type: "string", description: "Filename including extension (e.g. report.txt)" },
        filetype: { type: "string", description: "File type for syntax highlighting (e.g. python, javascript, text)" },
        title: { type: "string", description: "Title of the file" },
        initial_comment: { type: "string", description: "Initial comment to post with the file" },
        thread_ts: { type: "string", description: "Thread timestamp to post the file as a reply" },
      },
      required: ["channels", "content", "filename"],
    },
  },
  {
    name: "delete_file",
    description: "Delete a file from Slack. Only files owned by the authenticated user can be deleted.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string", description: "File ID to delete" },
      },
      required: ["file"],
    },
  },
];
