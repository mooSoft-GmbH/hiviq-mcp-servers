// ── Tool Result ───────────────────────────────────────────────────────────────

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

// ── ADF (Atlassian Document Format) ──────────────────────────────────────────

export interface AdfNode {
  type: string;
  text?: string;
  content?: AdfNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
}

export interface AdfDocument {
  version: 1;
  type: "doc";
  content: AdfNode[];
}

// ── Users ────────────────────────────────────────────────────────────────────

export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  active: boolean;
  avatarUrls?: Record<string, string>;
  accountType?: string;
  self?: string;
}

// ── Status / Priority / Resolution ───────────────────────────────────────────

export interface JiraStatus {
  id: string;
  name: string;
  description?: string;
  statusCategory?: {
    id: number;
    key: string;
    name: string;
    colorName: string;
  };
}

export interface JiraPriority {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface JiraResolution {
  id: string;
  name: string;
  description?: string;
}

// ── Issue Types ──────────────────────────────────────────────────────────────

export interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
  subtask: boolean;
  iconUrl?: string;
  hierarchyLevel?: number;
}

// ── Projects ─────────────────────────────────────────────────────────────────

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  projectTypeKey?: string;
  lead?: JiraUser;
  avatarUrls?: Record<string, string>;
  self?: string;
  style?: string;
}

export interface JiraComponent {
  id: string;
  name: string;
  description?: string;
  lead?: JiraUser;
  assigneeType?: string;
  project?: string;
}

export interface JiraVersion {
  id: string;
  name: string;
  description?: string;
  released: boolean;
  archived: boolean;
  releaseDate?: string;
  startDate?: string;
  projectId?: number;
}

// ── Issues ───────────────────────────────────────────────────────────────────

export interface JiraIssue {
  id: string;
  key: string;
  self?: string;
  fields: {
    summary: string;
    description?: AdfDocument | null;
    status?: JiraStatus;
    priority?: JiraPriority;
    resolution?: JiraResolution | null;
    issuetype?: JiraIssueType;
    assignee?: JiraUser | null;
    reporter?: JiraUser | null;
    creator?: JiraUser | null;
    project?: JiraProject;
    labels?: string[];
    components?: JiraComponent[];
    fixVersions?: JiraVersion[];
    created?: string;
    updated?: string;
    resolutiondate?: string | null;
    duedate?: string | null;
    parent?: { id: string; key: string; fields?: { summary?: string } };
    subtasks?: Array<{ id: string; key: string; fields?: { summary?: string; status?: JiraStatus } }>;
    issuelinks?: JiraIssueLink[];
    worklog?: { total: number; worklogs: JiraWorklog[] };
    attachment?: JiraAttachment[];
    comment?: { total: number; comments: JiraComment[] };
    watches?: { watchCount: number; isWatching: boolean };
    votes?: { votes: number; hasVoted: boolean };
    [key: string]: unknown;
  };
  changelog?: { histories: JiraChangelog[] };
}

// ── Comments ─────────────────────────────────────────────────────────────────

export interface JiraComment {
  id: string;
  author?: JiraUser;
  body?: AdfDocument;
  created: string;
  updated: string;
  self?: string;
}

// ── Worklogs ─────────────────────────────────────────────────────────────────

export interface JiraWorklog {
  id: string;
  author?: JiraUser;
  comment?: AdfDocument;
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
  created: string;
  updated: string;
  self?: string;
}

// ── Attachments ──────────────────────────────────────────────────────────────

export interface JiraAttachment {
  id: string;
  filename: string;
  author?: JiraUser;
  created: string;
  size: number;
  mimeType: string;
  content?: string;
  self?: string;
}

// ── Issue Links ──────────────────────────────────────────────────────────────

export interface JiraIssueLinkType {
  id: string;
  name: string;
  inward: string;
  outward: string;
}

export interface JiraIssueLink {
  id: string;
  type: JiraIssueLinkType;
  inwardIssue?: { id: string; key: string; fields?: { summary?: string; status?: JiraStatus } };
  outwardIssue?: { id: string; key: string; fields?: { summary?: string; status?: JiraStatus } };
}

export interface JiraRemoteLink {
  id: number;
  self?: string;
  globalId?: string;
  application?: { type?: string; name?: string };
  relationship?: string;
  object: {
    url: string;
    title: string;
    summary?: string;
    icon?: { url16x16?: string; title?: string };
  };
}

// ── Changelogs ───────────────────────────────────────────────────────────────

export interface JiraChangelog {
  id: string;
  author?: JiraUser;
  created: string;
  items: Array<{
    field: string;
    fieldtype: string;
    from?: string | null;
    fromString?: string | null;
    to?: string | null;
    toString?: string | null;
  }>;
}

// ── Transitions ──────────────────────────────────────────────────────────────

export interface JiraTransition {
  id: string;
  name: string;
  to: JiraStatus;
  hasScreen?: boolean;
  isGlobal?: boolean;
  isInitial?: boolean;
  isAvailable?: boolean;
}

// ── Search ───────────────────────────────────────────────────────────────────

export interface JiraSearchResult {
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}

// ── Watchers ─────────────────────────────────────────────────────────────────

export interface JiraWatchers {
  watchCount: number;
  isWatching: boolean;
  watchers: JiraUser[];
  self?: string;
}

// ── Boards (Agile) ───────────────────────────────────────────────────────────

export interface JiraBoard {
  id: number;
  name: string;
  type: string;
  self?: string;
  location?: {
    projectId?: number;
    projectKey?: string;
    projectName?: string;
  };
}

export interface JiraBoardConfig {
  id: number;
  name: string;
  type: string;
  self?: string;
  columnConfig?: {
    columns: Array<{
      name: string;
      statuses: Array<{ id: string }>;
    }>;
  };
  estimation?: {
    type: string;
    field?: { fieldId: string; displayName: string };
  };
  ranking?: { rankCustomFieldId: number };
}

// ── Sprints (Agile) ──────────────────────────────────────────────────────────

export interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  goal?: string;
  originBoardId?: number;
  self?: string;
}

// ── Epics (Agile) ────────────────────────────────────────────────────────────

export interface JiraEpic {
  id: number;
  key: string;
  name: string;
  summary: string;
  done: boolean;
  self?: string;
}

// ── Votes ────────────────────────────────────────────────────────────────────

export interface JiraVotes {
  votes: number;
  hasVoted: boolean;
  voters: JiraUser[];
  self?: string;
}

// ── Filters ──────────────────────────────────────────────────────────────────

export interface JiraFilter {
  id: string;
  name: string;
  description?: string;
  jql: string;
  owner?: JiraUser;
  favourite: boolean;
  self?: string;
  viewUrl?: string;
  searchUrl?: string;
}

// ── Dashboards ───────────────────────────────────────────────────────────────

export interface JiraDashboard {
  id: string;
  name: string;
  description?: string;
  owner?: JiraUser;
  isFavourite?: boolean;
  self?: string;
  view?: string;
}

// ── Fields ───────────────────────────────────────────────────────────────────

export interface JiraField {
  id: string;
  name: string;
  custom: boolean;
  orderable?: boolean;
  navigable?: boolean;
  searchable?: boolean;
  clauseNames?: string[];
  schema?: {
    type: string;
    system?: string;
    custom?: string;
    customId?: number;
  };
}

// ── Server Info ──────────────────────────────────────────────────────────────

export interface JiraServerInfo {
  baseUrl: string;
  version: string;
  deploymentType: string;
  buildNumber: number;
  serverTitle?: string;
  defaultLocale?: { locale: string };
}

// ── Paginated Responses ──────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  startAt: number;
  maxResults: number;
  total: number;
  values: T[];
  isLast?: boolean;
}

export interface AgilePagedResponse<T> {
  maxResults: number;
  startAt: number;
  total?: number;
  isLast: boolean;
  values: T[];
}
