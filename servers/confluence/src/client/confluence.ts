import type { Config } from "../config.js";
import type {
  Ancestor,
  Attachment,
  BlogPost,
  Comment,
  Label,
  Page,
  PaginatedResponse,
  SearchResponse,
  Space,
} from "../types.js";

export type Fetcher = typeof fetch;

export class ConfluenceApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
  ) {
    super(message);
    this.name = "ConfluenceApiError";
  }
}

export class ConfluenceClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly fetcher: Fetcher;

  constructor(config: Pick<Config, "CONFLUENCE_BASE_URL" | "CONFLUENCE_EMAIL" | "CONFLUENCE_API_TOKEN">, fetcher: Fetcher = fetch) {
    this.baseUrl = config.CONFLUENCE_BASE_URL.replace(/\/$/, "");
    this.authHeader =
      "Basic " + Buffer.from(`${config.CONFLUENCE_EMAIL}:${config.CONFLUENCE_API_TOKEN}`).toString("base64");
    this.fetcher = fetcher;
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
      throw new ConfluenceApiError(
        res.status,
        res.statusText,
        `Confluence API error ${res.status} ${res.statusText}: ${body}`,
      );
    }

    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  }

  private buildQuery(params: Record<string, string | number | undefined>): string {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string | number][];
    if (entries.length === 0) return "";
    return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  }

  // ── Spaces ──────────────────────────────────────────────────────────────────

  async listSpaces(params?: { limit?: number; cursor?: string; type?: string; status?: string }): Promise<PaginatedResponse<Space>> {
    return this.request(`/wiki/api/v2/spaces${this.buildQuery({ ...params })}`);
  }

  async getSpace(spaceId: string): Promise<Space> {
    return this.request(`/wiki/api/v2/spaces/${spaceId}`);
  }

  // ── Pages ───────────────────────────────────────────────────────────────────

  async listPages(params?: {
    spaceId?: string;
    limit?: number;
    cursor?: string;
    status?: string;
    title?: string;
  }): Promise<PaginatedResponse<Page>> {
    return this.request(`/wiki/api/v2/pages${this.buildQuery({ ...params, "body-format": "storage" })}`);
  }

  async getPage(pageId: string): Promise<Page> {
    return this.request(`/wiki/api/v2/pages/${pageId}?body-format=storage`);
  }

  async getChildPages(pageId: string, params?: { limit?: number; cursor?: string }): Promise<PaginatedResponse<Page>> {
    return this.request(`/wiki/api/v2/pages/${pageId}/children${this.buildQuery({ ...params })}`);
  }

  async getAncestors(pageId: string): Promise<PaginatedResponse<Ancestor>> {
    return this.request(`/wiki/api/v2/pages/${pageId}/ancestors`);
  }

  async createPage(body: {
    spaceId: string;
    title: string;
    parentId?: string;
    status?: "current" | "draft";
    body: { representation: "storage"; value: string };
  }): Promise<Page> {
    return this.request("/wiki/api/v2/pages", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updatePage(
    pageId: string,
    body: {
      id: string;
      title: string;
      version: { number: number; message?: string };
      status?: "current" | "draft";
      body?: { representation: "storage"; value: string };
    },
  ): Promise<Page> {
    return this.request(`/wiki/api/v2/pages/${pageId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async deletePage(pageId: string): Promise<void> {
    return this.request(`/wiki/api/v2/pages/${pageId}`, { method: "DELETE" });
  }

  // ── Search ───────────────────────────────────────────────────────────────────

  async search(params: {
    cql: string;
    limit?: number;
    start?: number;
    excerpt?: "indexed" | "highlight" | "none";
  }): Promise<SearchResponse> {
    return this.request(`/wiki/rest/api/search${this.buildQuery({ ...params })}`);
  }

  // ── Comments ─────────────────────────────────────────────────────────────────

  async listFooterComments(pageId: string, params?: { limit?: number; cursor?: string }): Promise<PaginatedResponse<Comment>> {
    return this.request(`/wiki/api/v2/pages/${pageId}/footer-comments${this.buildQuery({ ...params, "body-format": "storage" })}`);
  }

  async addFooterComment(pageId: string, body: { value: string; representation: "storage" }): Promise<Comment> {
    return this.request(`/wiki/api/v2/pages/${pageId}/footer-comments`, {
      method: "POST",
      body: JSON.stringify({ pageId, body }),
    });
  }

  // ── Labels ───────────────────────────────────────────────────────────────────

  async listLabels(pageId: string): Promise<PaginatedResponse<Label>> {
    return this.request(`/wiki/api/v2/pages/${pageId}/labels`);
  }

  async addLabel(pageId: string, name: string, prefix = "global"): Promise<PaginatedResponse<Label>> {
    return this.request(`/wiki/api/v2/pages/${pageId}/labels`, {
      method: "POST",
      body: JSON.stringify([{ name, prefix }]),
    });
  }

  async removeLabel(pageId: string, name: string, prefix = "global"): Promise<void> {
    return this.request(`/wiki/api/v2/pages/${pageId}/labels?name=${encodeURIComponent(name)}&prefix=${prefix}`, {
      method: "DELETE",
    });
  }

  // ── Attachments ───────────────────────────────────────────────────────────────

  async listAttachments(pageId: string, params?: { limit?: number; cursor?: string; mediaType?: string }): Promise<PaginatedResponse<Attachment>> {
    return this.request(`/wiki/api/v2/pages/${pageId}/attachments${this.buildQuery({ ...params })}`);
  }

  // ── Blog Posts ────────────────────────────────────────────────────────────────

  async listBlogPosts(params?: { spaceId?: string; limit?: number; cursor?: string; status?: string }): Promise<PaginatedResponse<BlogPost>> {
    return this.request(`/wiki/api/v2/blogposts${this.buildQuery({ ...params, "body-format": "storage" })}`);
  }

  async getBlogPost(blogPostId: string): Promise<BlogPost> {
    return this.request(`/wiki/api/v2/blogposts/${blogPostId}?body-format=storage`);
  }
}
