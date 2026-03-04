import type { Config } from "../config.js";
import type {
  AdfDocument,
  AgilePagedResponse,
  JiraAttachment,
  JiraBoard,
  JiraBoardConfig,
  JiraChangelog,
  JiraComment,
  JiraComponent,
  JiraDashboard,
  JiraEpic,
  JiraField,
  JiraFilter,
  JiraIssue,
  JiraIssueLinkType,
  JiraIssueType,
  JiraPriority,
  JiraRemoteLink,
  JiraResolution,
  JiraSearchResult,
  JiraServerInfo,
  JiraSprint,
  JiraStatus,
  JiraTransition,
  JiraUser,
  JiraVersion,
  JiraVotes,
  JiraWatchers,
  JiraWorklog,
  PaginatedResponse,
} from "../types.js";

export type Fetcher = typeof fetch;

export class JiraApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
  ) {
    super(message);
    this.name = "JiraApiError";
  }
}

export class JiraClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly fetcher: Fetcher;

  constructor(
    config: Pick<Config, "JIRA_BASE_URL" | "JIRA_EMAIL" | "JIRA_API_TOKEN">,
    fetcher: Fetcher = fetch,
  ) {
    this.baseUrl = config.JIRA_BASE_URL.replace(/\/$/, "");
    this.authHeader =
      "Basic " +
      Buffer.from(`${config.JIRA_EMAIL}:${config.JIRA_API_TOKEN}`).toString("base64");
    this.fetcher = fetcher;
  }

  private async requestV3<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(`/rest/api/3${path}`, options);
  }

  private async requestAgile<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(`/rest/agile/1.0${path}`, options);
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await this.fetcher(url, {
      ...options,
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new JiraApiError(
        res.status,
        res.statusText,
        `Jira API error ${res.status} ${res.statusText}: ${body}`,
      );
    }

    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  }

  private buildQuery(params: Record<string, string | number | boolean | undefined>): string {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [
      string,
      string | number | boolean,
    ][];
    if (entries.length === 0) return "";
    return (
      "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")
    );
  }

  // ── Issues ──────────────────────────────────────────────────────────────────

  async getIssue(
    issueIdOrKey: string,
    params?: { fields?: string; expand?: string },
  ): Promise<JiraIssue> {
    return this.requestV3(`/issue/${issueIdOrKey}${this.buildQuery({ ...params })}`);
  }

  async createIssue(body: {
    fields: Record<string, unknown>;
  }): Promise<{ id: string; key: string; self: string }> {
    return this.requestV3("/issue", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateIssue(issueIdOrKey: string, body: { fields: Record<string, unknown> }): Promise<void> {
    await this.requestV3(`/issue/${issueIdOrKey}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async deleteIssue(issueIdOrKey: string): Promise<void> {
    await this.requestV3(`/issue/${issueIdOrKey}`, { method: "DELETE" });
  }

  async assignIssue(issueIdOrKey: string, accountId: string | null): Promise<void> {
    await this.requestV3(`/issue/${issueIdOrKey}/assignee`, {
      method: "PUT",
      body: JSON.stringify({ accountId }),
    });
  }

  async getTransitions(
    issueIdOrKey: string,
  ): Promise<{ transitions: JiraTransition[] }> {
    return this.requestV3(`/issue/${issueIdOrKey}/transitions`);
  }

  async transitionIssue(issueIdOrKey: string, transitionId: string): Promise<void> {
    await this.requestV3(`/issue/${issueIdOrKey}/transitions`, {
      method: "POST",
      body: JSON.stringify({ transition: { id: transitionId } }),
    });
  }

  async listIssueTypes(projectIdOrKey?: string): Promise<JiraIssueType[]> {
    if (projectIdOrKey) {
      const project = await this.requestV3<{ issueTypes: JiraIssueType[] }>(
        `/project/${projectIdOrKey}`,
      );
      return project.issueTypes;
    }
    return this.requestV3("/issuetype");
  }

  async getIssueChangelogs(
    issueIdOrKey: string,
    params?: { startAt?: number; maxResults?: number },
  ): Promise<PaginatedResponse<JiraChangelog>> {
    return this.requestV3(
      `/issue/${issueIdOrKey}/changelog${this.buildQuery({ ...params })}`,
    );
  }

  async bulkGetIssues(
    issueIdsOrKeys: string[],
    params?: { fields?: string },
  ): Promise<JiraSearchResult> {
    const jql = `key in (${issueIdsOrKeys.join(",")})`;
    return this.searchIssues({ jql, fields: params?.fields });
  }

  // ── Search ──────────────────────────────────────────────────────────────────

  async searchIssues(params: {
    jql: string;
    startAt?: number;
    maxResults?: number;
    fields?: string;
  }): Promise<JiraSearchResult> {
    return this.requestV3("/search/jql" + this.buildQuery({ ...params }));
  }

  // ── Comments ────────────────────────────────────────────────────────────────

  async listComments(
    issueIdOrKey: string,
    params?: { startAt?: number; maxResults?: number; orderBy?: string },
  ): Promise<{ total: number; comments: JiraComment[] }> {
    return this.requestV3(
      `/issue/${issueIdOrKey}/comment${this.buildQuery({ ...params })}`,
    );
  }

  async addComment(
    issueIdOrKey: string,
    body: AdfDocument,
  ): Promise<JiraComment> {
    return this.requestV3(`/issue/${issueIdOrKey}/comment`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }

  async updateComment(
    issueIdOrKey: string,
    commentId: string,
    body: AdfDocument,
  ): Promise<JiraComment> {
    return this.requestV3(`/issue/${issueIdOrKey}/comment/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ body }),
    });
  }

  async deleteComment(issueIdOrKey: string, commentId: string): Promise<void> {
    await this.requestV3(`/issue/${issueIdOrKey}/comment/${commentId}`, {
      method: "DELETE",
    });
  }

  // ── Projects ────────────────────────────────────────────────────────────────

  async listProjects(params?: {
    startAt?: number;
    maxResults?: number;
    orderBy?: string;
    expand?: string;
  }): Promise<PaginatedResponse<JiraProject>> {
    return this.requestV3(`/project/search${this.buildQuery({ ...params })}`);
  }

  async getProject(
    projectIdOrKey: string,
    params?: { expand?: string },
  ): Promise<JiraProject & { issueTypes: JiraIssueType[] }> {
    return this.requestV3(`/project/${projectIdOrKey}${this.buildQuery({ ...params })}`);
  }

  async createProject(body: {
    key: string;
    name: string;
    projectTypeKey: string;
    projectTemplateKey: string;
    description?: string;
    leadAccountId?: string;
    assigneeType?: string;
  }): Promise<JiraProject> {
    return this.requestV3("/project", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateProject(
    projectIdOrKey: string,
    body: { name?: string; description?: string; leadAccountId?: string; assigneeType?: string },
  ): Promise<JiraProject> {
    return this.requestV3(`/project/${projectIdOrKey}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async deleteProject(projectIdOrKey: string, enableUndo?: boolean): Promise<void> {
    await this.requestV3(
      `/project/${projectIdOrKey}${this.buildQuery({ enableUndo })}`,
      { method: "DELETE" },
    );
  }

  async listProjectComponents(projectIdOrKey: string): Promise<JiraComponent[]> {
    return this.requestV3(`/project/${projectIdOrKey}/components`);
  }

  async listProjectVersions(
    projectIdOrKey: string,
    params?: { startAt?: number; maxResults?: number; orderBy?: string },
  ): Promise<PaginatedResponse<JiraVersion>> {
    return this.requestV3(
      `/project/${projectIdOrKey}/version${this.buildQuery({ ...params })}`,
    );
  }

  // ── Users ───────────────────────────────────────────────────────────────────

  async getMyself(): Promise<JiraUser> {
    return this.requestV3("/myself");
  }

  async getUser(accountId: string): Promise<JiraUser> {
    return this.requestV3(`/user${this.buildQuery({ accountId })}`);
  }

  async searchUsers(params: {
    query: string;
    startAt?: number;
    maxResults?: number;
  }): Promise<JiraUser[]> {
    return this.requestV3(`/user/search${this.buildQuery({ ...params })}`);
  }

  async findUsersAssignable(params: {
    project?: string;
    issueKey?: string;
    query?: string;
    maxResults?: number;
  }): Promise<JiraUser[]> {
    return this.requestV3(
      `/user/assignable/search${this.buildQuery({ ...params })}`,
    );
  }

  // ── Worklogs ────────────────────────────────────────────────────────────────

  async listWorklogs(
    issueIdOrKey: string,
    params?: { startAt?: number; maxResults?: number },
  ): Promise<{ total: number; worklogs: JiraWorklog[] }> {
    return this.requestV3(
      `/issue/${issueIdOrKey}/worklog${this.buildQuery({ ...params })}`,
    );
  }

  async addWorklog(
    issueIdOrKey: string,
    body: { timeSpent?: string; timeSpentSeconds?: number; started?: string; comment?: AdfDocument },
  ): Promise<JiraWorklog> {
    return this.requestV3(`/issue/${issueIdOrKey}/worklog`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateWorklog(
    issueIdOrKey: string,
    worklogId: string,
    body: { timeSpent?: string; timeSpentSeconds?: number; started?: string; comment?: AdfDocument },
  ): Promise<JiraWorklog> {
    return this.requestV3(`/issue/${issueIdOrKey}/worklog/${worklogId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async deleteWorklog(issueIdOrKey: string, worklogId: string): Promise<void> {
    await this.requestV3(`/issue/${issueIdOrKey}/worklog/${worklogId}`, {
      method: "DELETE",
    });
  }

  // ── Attachments ─────────────────────────────────────────────────────────────

  async listAttachments(issueIdOrKey: string): Promise<JiraAttachment[]> {
    const issue = await this.getIssue(issueIdOrKey, { fields: "attachment" });
    return issue.fields.attachment ?? [];
  }

  async addAttachment(
    issueIdOrKey: string,
    filename: string,
    content: string,
  ): Promise<JiraAttachment[]> {
    const formData = new FormData();
    formData.append("file", new Blob([content]), filename);
    return this.request(`/rest/api/3/issue/${issueIdOrKey}/attachments`, {
      method: "POST",
      headers: {
        "X-Atlassian-Token": "no-check",
      } as Record<string, string>,
      body: formData as unknown as string,
    });
  }

  // ── Watchers ────────────────────────────────────────────────────────────────

  async listWatchers(issueIdOrKey: string): Promise<JiraWatchers> {
    return this.requestV3(`/issue/${issueIdOrKey}/watchers`);
  }

  async addWatcher(issueIdOrKey: string, accountId: string): Promise<void> {
    await this.requestV3(`/issue/${issueIdOrKey}/watchers`, {
      method: "POST",
      body: JSON.stringify(accountId),
    });
  }

  async removeWatcher(issueIdOrKey: string, accountId: string): Promise<void> {
    await this.requestV3(
      `/issue/${issueIdOrKey}/watchers${this.buildQuery({ accountId })}`,
      { method: "DELETE" },
    );
  }

  // ── Issue Links ─────────────────────────────────────────────────────────────

  async listLinkTypes(): Promise<{ issueLinkTypes: JiraIssueLinkType[] }> {
    return this.requestV3("/issueLinkType");
  }

  async createLink(body: {
    type: { name: string };
    inwardIssue: { key: string };
    outwardIssue: { key: string };
  }): Promise<void> {
    await this.requestV3("/issueLink", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async deleteLink(linkId: string): Promise<void> {
    await this.requestV3(`/issueLink/${linkId}`, { method: "DELETE" });
  }

  async listRemoteLinks(issueIdOrKey: string): Promise<JiraRemoteLink[]> {
    return this.requestV3(`/issue/${issueIdOrKey}/remotelink`);
  }

  // ── Boards (Agile) ─────────────────────────────────────────────────────────

  async listBoards(params?: {
    startAt?: number;
    maxResults?: number;
    type?: string;
    name?: string;
    projectKeyOrId?: string;
  }): Promise<AgilePagedResponse<JiraBoard>> {
    return this.requestAgile(`/board${this.buildQuery({ ...params })}`);
  }

  async getBoard(boardId: number): Promise<JiraBoard> {
    return this.requestAgile(`/board/${boardId}`);
  }

  async getBoardConfiguration(boardId: number): Promise<JiraBoardConfig> {
    return this.requestAgile(`/board/${boardId}/configuration`);
  }

  async createBoard(body: {
    name: string;
    type: string;
    filterId: number;
  }): Promise<JiraBoard> {
    return this.requestAgile("/board", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async deleteBoard(boardId: number): Promise<void> {
    await this.requestAgile(`/board/${boardId}`, { method: "DELETE" });
  }

  // ── Sprints (Agile) ────────────────────────────────────────────────────────

  async listSprints(
    boardId: number,
    params?: { startAt?: number; maxResults?: number; state?: string },
  ): Promise<AgilePagedResponse<JiraSprint>> {
    return this.requestAgile(`/board/${boardId}/sprint${this.buildQuery({ ...params })}`);
  }

  async getSprint(sprintId: number): Promise<JiraSprint> {
    return this.requestAgile(`/sprint/${sprintId}`);
  }

  async createSprint(body: {
    name: string;
    startDate?: string;
    endDate?: string;
    goal?: string;
    originBoardId: number;
  }): Promise<JiraSprint> {
    return this.requestAgile("/sprint", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateSprint(
    sprintId: number,
    body: { name?: string; state?: string; startDate?: string; endDate?: string; goal?: string },
  ): Promise<JiraSprint> {
    return this.requestAgile(`/sprint/${sprintId}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getSprintIssues(
    sprintId: number,
    params?: { startAt?: number; maxResults?: number; fields?: string },
  ): Promise<AgilePagedResponse<JiraIssue>> {
    return this.requestAgile(`/sprint/${sprintId}/issue${this.buildQuery({ ...params })}`);
  }

  async moveIssuesToSprint(
    sprintId: number,
    issueKeys: string[],
  ): Promise<void> {
    await this.requestAgile(`/sprint/${sprintId}/issue`, {
      method: "POST",
      body: JSON.stringify({ issues: issueKeys }),
    });
  }

  // ── Epics (Agile) ──────────────────────────────────────────────────────────

  async getEpic(epicIdOrKey: string): Promise<JiraEpic> {
    return this.requestAgile(`/epic/${epicIdOrKey}`);
  }

  async getEpicIssues(
    epicIdOrKey: string,
    params?: { startAt?: number; maxResults?: number; fields?: string },
  ): Promise<AgilePagedResponse<JiraIssue>> {
    return this.requestAgile(`/epic/${epicIdOrKey}/issue${this.buildQuery({ ...params })}`);
  }

  async moveIssuesToEpic(epicIdOrKey: string, issueKeys: string[]): Promise<void> {
    await this.requestAgile(`/epic/${epicIdOrKey}/issue`, {
      method: "POST",
      body: JSON.stringify({ issues: issueKeys }),
    });
  }

  // ── Backlog (Agile) ────────────────────────────────────────────────────────

  async moveIssuesToBacklog(issueKeys: string[]): Promise<void> {
    await this.requestAgile("/backlog/issue", {
      method: "POST",
      body: JSON.stringify({ issues: issueKeys }),
    });
  }

  // ── Votes ──────────────────────────────────────────────────────────────────

  async getVotes(issueIdOrKey: string): Promise<JiraVotes> {
    return this.requestV3(`/issue/${issueIdOrKey}/votes`);
  }

  async addVote(issueIdOrKey: string): Promise<void> {
    await this.requestV3(`/issue/${issueIdOrKey}/votes`, { method: "POST" });
  }

  async removeVote(issueIdOrKey: string): Promise<void> {
    await this.requestV3(`/issue/${issueIdOrKey}/votes`, { method: "DELETE" });
  }

  // ── Filters ─────────────────────────────────────────────────────────────────

  async listMyFilters(params?: { expand?: string }): Promise<JiraFilter[]> {
    return this.requestV3(`/filter/my${this.buildQuery({ ...params })}`);
  }

  async getFilter(filterId: string, params?: { expand?: string }): Promise<JiraFilter> {
    return this.requestV3(`/filter/${filterId}${this.buildQuery({ ...params })}`);
  }

  async createFilter(body: {
    name: string;
    jql: string;
    description?: string;
    favourite?: boolean;
  }): Promise<JiraFilter> {
    return this.requestV3("/filter", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateFilter(
    filterId: string,
    body: { name?: string; jql?: string; description?: string; favourite?: boolean },
  ): Promise<JiraFilter> {
    return this.requestV3(`/filter/${filterId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async deleteFilter(filterId: string): Promise<void> {
    await this.requestV3(`/filter/${filterId}`, { method: "DELETE" });
  }

  // ── Dashboards ──────────────────────────────────────────────────────────────

  async listDashboards(params?: {
    startAt?: number;
    maxResults?: number;
    filter?: string;
  }): Promise<PaginatedResponse<JiraDashboard>> {
    return this.requestV3(`/dashboard${this.buildQuery({ ...params })}`);
  }

  async getDashboard(dashboardId: string): Promise<JiraDashboard> {
    return this.requestV3(`/dashboard/${dashboardId}`);
  }

  // ── Fields ──────────────────────────────────────────────────────────────────

  async listFields(): Promise<JiraField[]> {
    return this.requestV3("/field");
  }

  async searchFields(params: {
    query?: string;
    type?: string;
    startAt?: number;
    maxResults?: number;
  }): Promise<PaginatedResponse<JiraField>> {
    return this.requestV3(`/field/search${this.buildQuery({ ...params })}`);
  }

  // ── Labels ──────────────────────────────────────────────────────────────────

  async getAllLabels(params?: { startAt?: number; maxResults?: number }): Promise<{
    total: number;
    values: string[];
  }> {
    return this.requestV3(`/label${this.buildQuery({ ...params })}`);
  }

  // ── Priorities ──────────────────────────────────────────────────────────────

  async listPriorities(): Promise<JiraPriority[]> {
    return this.requestV3("/priority");
  }

  // ── Resolutions ─────────────────────────────────────────────────────────────

  async listResolutions(): Promise<JiraResolution[]> {
    return this.requestV3("/resolution");
  }

  // ── Statuses ────────────────────────────────────────────────────────────────

  async listStatuses(): Promise<JiraStatus[]> {
    return this.requestV3("/status");
  }

  // ── Server Info ─────────────────────────────────────────────────────────────

  async getServerInfo(): Promise<JiraServerInfo> {
    return this.requestV3("/serverInfo");
  }
}
