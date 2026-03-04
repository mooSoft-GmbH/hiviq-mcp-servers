import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ZodError } from "zod";
import type { JiraClient } from "./client/jira.js";
import type { ToolResult } from "./types.js";

// Domain tools
import { issueTools } from "./domains/issues/tools.js";
import { searchTools } from "./domains/search/tools.js";
import { commentTools } from "./domains/comments/tools.js";
import { projectTools } from "./domains/projects/tools.js";
import { userTools } from "./domains/users/tools.js";
import { worklogTools } from "./domains/worklogs/tools.js";
import { attachmentTools } from "./domains/attachments/tools.js";
import { watcherTools } from "./domains/watchers/tools.js";
import { linkTools } from "./domains/links/tools.js";
import { boardTools } from "./domains/boards/tools.js";
import { sprintTools } from "./domains/sprints/tools.js";
import { epicTools } from "./domains/epics/tools.js";
import { filterTools } from "./domains/filters/tools.js";

// Domain handlers
import {
  handleGetIssue,
  handleCreateIssue,
  handleUpdateIssue,
  handleDeleteIssue,
  handleAssignIssue,
  handleGetTransitions,
  handleTransitionIssue,
  handleListIssueTypes,
  handleGetIssueChangelogs,
  handleBulkGetIssues,
} from "./domains/issues/handlers.js";
import { handleSearchIssues, handleSearchText } from "./domains/search/handlers.js";
import {
  handleListComments,
  handleAddComment,
  handleUpdateComment,
  handleDeleteComment,
} from "./domains/comments/handlers.js";
import {
  handleListProjects,
  handleGetProject,
  handleListProjectComponents,
  handleListProjectVersions,
} from "./domains/projects/handlers.js";
import {
  handleGetMyself,
  handleGetUser,
  handleSearchUsers,
  handleFindUsersAssignable,
} from "./domains/users/handlers.js";
import {
  handleListWorklogs,
  handleAddWorklog,
  handleUpdateWorklog,
  handleDeleteWorklog,
} from "./domains/worklogs/handlers.js";
import {
  handleListAttachments,
  handleAddAttachment,
} from "./domains/attachments/handlers.js";
import {
  handleListWatchers,
  handleAddWatcher,
  handleRemoveWatcher,
} from "./domains/watchers/handlers.js";
import {
  handleListLinkTypes,
  handleCreateLink,
  handleDeleteLink,
  handleListRemoteLinks,
} from "./domains/links/handlers.js";
import {
  handleListBoards,
  handleGetBoard,
  handleGetBoardConfiguration,
} from "./domains/boards/handlers.js";
import {
  handleListSprints,
  handleGetSprint,
  handleCreateSprint,
  handleUpdateSprint,
  handleGetSprintIssues,
  handleMoveIssuesToSprint,
} from "./domains/sprints/handlers.js";
import {
  handleGetEpic,
  handleGetEpicIssues,
  handleMoveIssuesToEpic,
  handleMoveIssuesToBacklog,
  handleGetVotes,
  handleAddVote,
  handleRemoveVote,
} from "./domains/epics/handlers.js";
import {
  handleListMyFilters,
  handleGetFilter,
  handleCreateFilter,
  handleUpdateFilter,
  handleDeleteFilter,
  handleListDashboards,
  handleGetDashboard,
  handleListFields,
  handleSearchFields,
  handleGetAllLabels,
  handleListPriorities,
  handleListResolutions,
  handleListStatuses,
  handleGetServerInfo,
} from "./domains/filters/handlers.js";

const ALL_TOOLS = [
  ...issueTools,
  ...searchTools,
  ...commentTools,
  ...projectTools,
  ...userTools,
  ...worklogTools,
  ...attachmentTools,
  ...watcherTools,
  ...linkTools,
  ...boardTools,
  ...sprintTools,
  ...epicTools,
  ...filterTools,
];

type Handler = (client: JiraClient, baseUrl: string, args: unknown) => Promise<ToolResult>;

export function createServer(client: JiraClient, baseUrl: string): Server {
  const server = new Server(
    { name: "hiviq-jira", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: ALL_TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handlers: Record<string, (a: unknown) => Promise<ToolResult>> = {
      // Issues
      get_issue: (a) => handleGetIssue(client, baseUrl, a),
      create_issue: (a) => handleCreateIssue(client, baseUrl, a),
      update_issue: (a) => handleUpdateIssue(client, baseUrl, a),
      delete_issue: (a) => handleDeleteIssue(client, baseUrl, a),
      assign_issue: (a) => handleAssignIssue(client, baseUrl, a),
      get_transitions: (a) => handleGetTransitions(client, baseUrl, a),
      transition_issue: (a) => handleTransitionIssue(client, baseUrl, a),
      list_issue_types: (a) => handleListIssueTypes(client, baseUrl, a),
      get_issue_changelogs: (a) => handleGetIssueChangelogs(client, baseUrl, a),
      bulk_get_issues: (a) => handleBulkGetIssues(client, baseUrl, a),
      // Search
      search_issues: (a) => handleSearchIssues(client, baseUrl, a),
      search_text: (a) => handleSearchText(client, baseUrl, a),
      // Comments
      list_comments: (a) => handleListComments(client, baseUrl, a),
      add_comment: (a) => handleAddComment(client, baseUrl, a),
      update_comment: (a) => handleUpdateComment(client, baseUrl, a),
      delete_comment: (a) => handleDeleteComment(client, baseUrl, a),
      // Projects
      list_projects: (a) => handleListProjects(client, baseUrl, a),
      get_project: (a) => handleGetProject(client, baseUrl, a),
      list_project_components: (a) => handleListProjectComponents(client, baseUrl, a),
      list_project_versions: (a) => handleListProjectVersions(client, baseUrl, a),
      // Users
      get_myself: (a) => handleGetMyself(client, baseUrl, a),
      get_user: (a) => handleGetUser(client, baseUrl, a),
      search_users: (a) => handleSearchUsers(client, baseUrl, a),
      find_users_assignable: (a) => handleFindUsersAssignable(client, baseUrl, a),
      // Worklogs
      list_worklogs: (a) => handleListWorklogs(client, baseUrl, a),
      add_worklog: (a) => handleAddWorklog(client, baseUrl, a),
      update_worklog: (a) => handleUpdateWorklog(client, baseUrl, a),
      delete_worklog: (a) => handleDeleteWorklog(client, baseUrl, a),
      // Attachments
      list_attachments: (a) => handleListAttachments(client, baseUrl, a),
      add_attachment: (a) => handleAddAttachment(client, baseUrl, a),
      // Watchers
      list_watchers: (a) => handleListWatchers(client, baseUrl, a),
      add_watcher: (a) => handleAddWatcher(client, baseUrl, a),
      remove_watcher: (a) => handleRemoveWatcher(client, baseUrl, a),
      // Links
      list_link_types: (a) => handleListLinkTypes(client, baseUrl, a),
      create_link: (a) => handleCreateLink(client, baseUrl, a),
      delete_link: (a) => handleDeleteLink(client, baseUrl, a),
      list_remote_links: (a) => handleListRemoteLinks(client, baseUrl, a),
      // Boards
      list_boards: (a) => handleListBoards(client, baseUrl, a),
      get_board: (a) => handleGetBoard(client, baseUrl, a),
      get_board_configuration: (a) => handleGetBoardConfiguration(client, baseUrl, a),
      // Sprints
      list_sprints: (a) => handleListSprints(client, baseUrl, a),
      get_sprint: (a) => handleGetSprint(client, baseUrl, a),
      create_sprint: (a) => handleCreateSprint(client, baseUrl, a),
      update_sprint: (a) => handleUpdateSprint(client, baseUrl, a),
      get_sprint_issues: (a) => handleGetSprintIssues(client, baseUrl, a),
      move_issues_to_sprint: (a) => handleMoveIssuesToSprint(client, baseUrl, a),
      // Epics / Backlog / Votes
      get_epic: (a) => handleGetEpic(client, baseUrl, a),
      get_epic_issues: (a) => handleGetEpicIssues(client, baseUrl, a),
      move_issues_to_epic: (a) => handleMoveIssuesToEpic(client, baseUrl, a),
      move_issues_to_backlog: (a) => handleMoveIssuesToBacklog(client, baseUrl, a),
      get_votes: (a) => handleGetVotes(client, baseUrl, a),
      add_vote: (a) => handleAddVote(client, baseUrl, a),
      remove_vote: (a) => handleRemoveVote(client, baseUrl, a),
      // Filters
      list_my_filters: (a) => handleListMyFilters(client, baseUrl, a),
      get_filter: (a) => handleGetFilter(client, baseUrl, a),
      create_filter: (a) => handleCreateFilter(client, baseUrl, a),
      update_filter: (a) => handleUpdateFilter(client, baseUrl, a),
      delete_filter: (a) => handleDeleteFilter(client, baseUrl, a),
      // Dashboards
      list_dashboards: (a) => handleListDashboards(client, baseUrl, a),
      get_dashboard: (a) => handleGetDashboard(client, baseUrl, a),
      // Fields
      list_fields: (a) => handleListFields(client, baseUrl, a),
      search_fields: (a) => handleSearchFields(client, baseUrl, a),
      // Labels
      get_all_labels: (a) => handleGetAllLabels(client, baseUrl, a),
      // Priorities / Resolutions / Statuses / Server
      list_priorities: (a) => handleListPriorities(client, baseUrl, a),
      list_resolutions: (a) => handleListResolutions(client, baseUrl, a),
      list_statuses: (a) => handleListStatuses(client, baseUrl, a),
      get_server_info: (a) => handleGetServerInfo(client, baseUrl, a),
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
