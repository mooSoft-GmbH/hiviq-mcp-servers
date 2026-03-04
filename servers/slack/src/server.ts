import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ZodError } from "zod";
import type { SlackClient } from "./client/slack.js";
import { handleAddBookmark, handleEditBookmark, handleListBookmarks, handleRemoveBookmark } from "./domains/bookmarks/handlers.js";
import { bookmarkTools } from "./domains/bookmarks/tools.js";
import { handleCreateCanvas, handleDeleteCanvas, handleEditCanvas } from "./domains/canvases/handlers.js";
import { canvasTools } from "./domains/canvases/tools.js";
import {
  handleArchiveConversation, handleCreateConversation, handleGetConversationHistory,
  handleGetConversationInfo, handleGetConversationReplies, handleInviteToConversation,
  handleJoinConversation, handleKickFromConversation, handleLeaveConversation,
  handleListConversations, handleOpenDirectMessage, handleRenameConversation,
  handleSetConversationPurpose, handleSetConversationTopic,
} from "./domains/conversations/handlers.js";
import { conversationTools } from "./domains/conversations/tools.js";
import { handleListFiles, handleGetFileInfo, handleUploadFile, handleDeleteFile } from "./domains/files/handlers.js";
import { fileTools } from "./domains/files/tools.js";
import { handleDeleteMessage, handleGetPermalink, handlePostMessage, handleScheduleMessage, handleUpdateMessage } from "./domains/messaging/handlers.js";
import { messagingTools } from "./domains/messaging/tools.js";
import { handleAddPin, handleListPins, handleRemovePin } from "./domains/pins/handlers.js";
import { pinTools } from "./domains/pins/tools.js";
import { handleAddReaction, handleGetReactions, handleRemoveReaction } from "./domains/reactions/handlers.js";
import { reactionTools } from "./domains/reactions/tools.js";
import { handleAddReminder, handleCompleteReminder, handleDeleteReminder, handleListReminders } from "./domains/reminders/handlers.js";
import { reminderTools } from "./domains/reminders/tools.js";
import { handleSearchFiles, handleSearchMessages } from "./domains/search/handlers.js";
import { searchTools } from "./domains/search/tools.js";
import { handleGetTeamInfo } from "./domains/team/handlers.js";
import { teamTools } from "./domains/team/tools.js";
import { handleGetUserInfo, handleGetUserPresence, handleGetUserProfile, handleListUsers, handleLookupUserByEmail, handleSetUserPresence } from "./domains/users/handlers.js";
import { userTools } from "./domains/users/tools.js";
import { handleCreateUsergroup, handleListUsergroupMembers, handleListUsergroups, handleUpdateUsergroup, handleUpdateUsergroupMembers } from "./domains/usergroups/handlers.js";
import { usergroupTools } from "./domains/usergroups/tools.js";
import type { ToolResult } from "./types.js";

const ALL_TOOLS = [
  ...messagingTools,
  ...conversationTools,
  ...userTools,
  ...searchTools,
  ...fileTools,
  ...reactionTools,
  ...pinTools,
  ...reminderTools,
  ...teamTools,
  ...canvasTools,
  ...bookmarkTools,
  ...usergroupTools,
];

export function createServer(client: SlackClient): Server {
  const server = new Server(
    { name: "hiviq-slack", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: ALL_TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handlers: Record<string, (args: unknown) => Promise<ToolResult>> = {
      // Messaging
      post_message: (a) => handlePostMessage(client, a),
      update_message: (a) => handleUpdateMessage(client, a),
      delete_message: (a) => handleDeleteMessage(client, a),
      schedule_message: (a) => handleScheduleMessage(client, a),
      get_permalink: (a) => handleGetPermalink(client, a),
      // Conversations
      list_conversations: (a) => handleListConversations(client, a),
      get_conversation_info: (a) => handleGetConversationInfo(client, a),
      get_conversation_history: (a) => handleGetConversationHistory(client, a),
      get_conversation_replies: (a) => handleGetConversationReplies(client, a),
      create_conversation: (a) => handleCreateConversation(client, a),
      archive_conversation: (a) => handleArchiveConversation(client, a),
      join_conversation: (a) => handleJoinConversation(client, a),
      leave_conversation: (a) => handleLeaveConversation(client, a),
      rename_conversation: (a) => handleRenameConversation(client, a),
      invite_to_conversation: (a) => handleInviteToConversation(client, a),
      kick_from_conversation: (a) => handleKickFromConversation(client, a),
      open_direct_message: (a) => handleOpenDirectMessage(client, a),
      set_conversation_topic: (a) => handleSetConversationTopic(client, a),
      set_conversation_purpose: (a) => handleSetConversationPurpose(client, a),
      // Users
      list_users: (a) => handleListUsers(client, a),
      get_user_info: (a) => handleGetUserInfo(client, a),
      get_user_presence: (a) => handleGetUserPresence(client, a),
      get_user_profile: (a) => handleGetUserProfile(client, a),
      lookup_user_by_email: (a) => handleLookupUserByEmail(client, a),
      set_user_presence: (a) => handleSetUserPresence(client, a),
      // Search
      search_messages: (a) => handleSearchMessages(client, a),
      search_files: (a) => handleSearchFiles(client, a),
      // Files
      list_files: (a) => handleListFiles(client, a),
      get_file_info: (a) => handleGetFileInfo(client, a),
      upload_file: (a) => handleUploadFile(client, a),
      delete_file: (a) => handleDeleteFile(client, a),
      // Reactions
      add_reaction: (a) => handleAddReaction(client, a),
      remove_reaction: (a) => handleRemoveReaction(client, a),
      get_reactions: (a) => handleGetReactions(client, a),
      // Pins
      list_pins: (a) => handleListPins(client, a),
      add_pin: (a) => handleAddPin(client, a),
      remove_pin: (a) => handleRemovePin(client, a),
      // Reminders
      list_reminders: (a) => handleListReminders(client, a),
      add_reminder: (a) => handleAddReminder(client, a),
      delete_reminder: (a) => handleDeleteReminder(client, a),
      complete_reminder: (a) => handleCompleteReminder(client, a),
      // Team
      get_team_info: (a) => handleGetTeamInfo(client, a),
      // Canvases
      create_canvas: (a) => handleCreateCanvas(client, a),
      edit_canvas: (a) => handleEditCanvas(client, a),
      delete_canvas: (a) => handleDeleteCanvas(client, a),
      // Bookmarks
      list_bookmarks: (a) => handleListBookmarks(client, a),
      add_bookmark: (a) => handleAddBookmark(client, a),
      edit_bookmark: (a) => handleEditBookmark(client, a),
      remove_bookmark: (a) => handleRemoveBookmark(client, a),
      // User Groups
      list_usergroups: (a) => handleListUsergroups(client, a),
      create_usergroup: (a) => handleCreateUsergroup(client, a),
      update_usergroup: (a) => handleUpdateUsergroup(client, a),
      list_usergroup_members: (a) => handleListUsergroupMembers(client, a),
      update_usergroup_members: (a) => handleUpdateUsergroupMembers(client, a),
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
