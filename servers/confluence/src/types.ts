// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  results: T[];
  _links?: {
    next?: string;
  };
}

// ── Spaces ───────────────────────────────────────────────────────────────────

export interface Space {
  id: string;
  key: string;
  name: string;
  type: "global" | "personal";
  status: "current" | "archived";
  description?: {
    plain?: { value: string };
  };
  _links?: { webui?: string };
}

// ── Pages ────────────────────────────────────────────────────────────────────

export interface Page {
  id: string;
  title: string;
  spaceId: string;
  parentId?: string;
  status: "current" | "archived" | "trashed";
  createdAt: string;
  authorId: string;
  version: {
    number: number;
    createdAt: string;
    authorId?: string;
    message?: string;
  };
  body?: {
    storage?: { value: string; representation: "storage" };
    atlas_doc_format?: { value: string };
  };
  _links?: { webui?: string };
}

export interface Ancestor {
  id: string;
  title: string;
}

// ── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  content?: {
    id: string;
    type: string;
    title: string;
    space?: { key: string; name: string };
    _links?: { webui?: string };
  };
  title: string;
  excerpt: string;
  url: string;
  lastModified: string;
  space?: { key: string; name: string };
}

export interface SearchResponse {
  results: SearchResult[];
  totalSize: number;
  start: number;
  limit: number;
}

// ── Comments ──────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  status: string;
  createdAt: string;
  authorId: string;
  body: {
    storage?: { value: string; representation: "storage" };
  };
  _links?: { webui?: string };
}

// ── Labels ───────────────────────────────────────────────────────────────────

export interface Label {
  id: string;
  name: string;
  prefix: string;
}

// ── Attachments ───────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  authorId: string;
  mediaType: string;
  fileSize: number;
  downloadLink?: string;
  _links?: { download?: string; webui?: string };
}

// ── Blog Posts ────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  spaceId: string;
  status: "current" | "archived" | "trashed";
  createdAt: string;
  authorId: string;
  version: {
    number: number;
    createdAt: string;
  };
  body?: {
    storage?: { value: string; representation: "storage" };
  };
  _links?: { webui?: string };
}

// ── Shared ────────────────────────────────────────────────────────────────────

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}
