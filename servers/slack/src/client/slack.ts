import type { Config } from "../config.js";

export type Fetcher = typeof fetch;

export class SlackApiError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = "SlackApiError";
  }
}

export class SlackClient {
  private readonly botToken: string;
  private readonly userToken?: string;
  private readonly fetcher: Fetcher;
  private static readonly BASE = "https://slack.com/api";

  constructor(config: Pick<Config, "SLACK_BOT_TOKEN" | "SLACK_USER_TOKEN">, fetcher: Fetcher = fetch) {
    this.botToken = config.SLACK_BOT_TOKEN;
    this.userToken = config.SLACK_USER_TOKEN;
    this.fetcher = fetcher;
  }

  // Methods that don't accept application/json and need form encoding
  private static readonly FORM_METHODS = new Set([
    "chat.getPermalink",
    "users.lookupByEmail",
    "users.getPresence",
    "files.upload",
  ]);

  private async call<T>(method: string, params: Record<string, unknown> = {}, useUserToken = false): Promise<T> {
    const token = useUserToken && this.userToken ? this.userToken : this.botToken;
    const useForm = SlackClient.FORM_METHODS.has(method);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    let body: string;
    if (useForm) {
      headers["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
      body = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ).toString();
    } else {
      headers["Content-Type"] = "application/json; charset=utf-8";
      body = JSON.stringify(params);
    }

    const res = await this.fetcher(`${SlackClient.BASE}/${method}`, {
      method: "POST",
      headers,
      body,
    });

    if (!res.ok) {
      throw new SlackApiError("http_error", `HTTP ${res.status} calling ${method}`);
    }

    const data = (await res.json()) as { ok: boolean; error?: string } & T;

    if (!data.ok) {
      throw new SlackApiError(data.error ?? "unknown_error", `Slack API error on ${method}: ${data.error}`);
    }

    return data;
  }

  // ── Messaging ────────────────────────────────────────────────────────────────

  async postMessage(params: {
    channel: string;
    text?: string;
    blocks?: unknown[];
    thread_ts?: string;
    username?: string;
    icon_emoji?: string;
    icon_url?: string;
    unfurl_links?: boolean;
    unfurl_media?: boolean;
  }) {
    return this.call<{ ts: string; channel: string }>("chat.postMessage", params);
  }

  async updateMessage(params: { channel: string; ts: string; text?: string; blocks?: unknown[] }) {
    return this.call<{ ts: string; channel: string }>("chat.update", params);
  }

  async deleteMessage(params: { channel: string; ts: string }) {
    return this.call("chat.delete", params);
  }

  async scheduleMessage(params: {
    channel: string;
    text: string;
    post_at: number;
    thread_ts?: string;
  }) {
    return this.call<{ scheduled_message_id: string; post_at: number; channel: string }>(
      "chat.scheduleMessage",
      params,
    );
  }

  async getPermalink(params: { channel: string; message_ts: string }) {
    return this.call<{ permalink: string; channel: string }>("chat.getPermalink", params);
  }

  // ── Conversations ─────────────────────────────────────────────────────────────

  async listConversations(params?: {
    types?: string;
    limit?: number;
    cursor?: string;
    exclude_archived?: boolean;
  }) {
    return this.call<{ channels: unknown[]; response_metadata: unknown }>("conversations.list", params ?? {});
  }

  async getConversationInfo(params: { channel: string; include_locale?: boolean }) {
    return this.call<{ channel: unknown }>("conversations.info", params);
  }

  async getConversationHistory(params: {
    channel: string;
    limit?: number;
    oldest?: string;
    latest?: string;
    inclusive?: boolean;
  }) {
    return this.call<{ messages: unknown[]; has_more: boolean }>("conversations.history", params);
  }

  async getConversationReplies(params: { channel: string; ts: string; limit?: number }) {
    return this.call<{ messages: unknown[]; has_more: boolean }>("conversations.replies", params);
  }

  async createConversation(params: { name: string; is_private?: boolean; team_id?: string }) {
    return this.call<{ channel: unknown }>("conversations.create", params);
  }

  async archiveConversation(params: { channel: string }) {
    return this.call("conversations.archive", params);
  }

  async joinConversation(params: { channel: string }) {
    return this.call<{ channel: unknown }>("conversations.join", params);
  }

  async leaveConversation(params: { channel: string }) {
    return this.call("conversations.leave", params);
  }

  async renameConversation(params: { channel: string; name: string }) {
    return this.call<{ channel: unknown }>("conversations.rename", params);
  }

  async inviteToConversation(params: { channel: string; users: string }) {
    return this.call<{ channel: unknown }>("conversations.invite", params);
  }

  async kickFromConversation(params: { channel: string; user: string }) {
    return this.call("conversations.kick", params);
  }

  async openDirectMessage(params: { users: string; return_im?: boolean }) {
    return this.call<{ channel: unknown }>("conversations.open", params);
  }

  async setConversationTopic(params: { channel: string; topic: string }) {
    return this.call<{ topic: string }>("conversations.setTopic", params);
  }

  async setConversationPurpose(params: { channel: string; purpose: string }) {
    return this.call<{ purpose: string }>("conversations.setPurpose", params);
  }

  // ── Users ─────────────────────────────────────────────────────────────────────

  async listUsers(params?: { limit?: number; cursor?: string }) {
    return this.call<{ members: unknown[]; response_metadata: unknown }>("users.list", params ?? {});
  }

  async getUserInfo(params: { user: string; include_locale?: boolean }) {
    return this.call<{ user: unknown }>("users.info", params);
  }

  async getUserPresence(params: { user: string }) {
    return this.call<{ presence: string; online?: boolean; auto_away?: boolean }>(
      "users.getPresence",
      params,
    );
  }

  async lookupUserByEmail(params: { email: string }) {
    return this.call<{ user: unknown }>("users.lookupByEmail", params);
  }

  async setUserPresence(params: { presence: "auto" | "away" }) {
    return this.call("users.setPresence", params);
  }

  async getUserProfile(params: { user: string; include_labels?: boolean }) {
    return this.call<{ profile: unknown }>("users.profile.get", params);
  }

  // ── Search ─────────────────────────────────────────────────────────────────────

  async searchMessages(params: {
    query: string;
    sort?: "score" | "timestamp";
    sort_dir?: "asc" | "desc";
    count?: number;
    page?: number;
  }) {
    return this.call<{ messages: { matches: unknown[]; total: number; pagination: unknown } }>(
      "search.messages",
      params,
      true, // requires user token
    );
  }

  async searchFiles(params: {
    query: string;
    sort?: "score" | "timestamp";
    sort_dir?: "asc" | "desc";
    count?: number;
    page?: number;
  }) {
    return this.call<{ files: { matches: unknown[]; total: number } }>(
      "search.files",
      params,
      true,
    );
  }

  // ── Files ─────────────────────────────────────────────────────────────────────

  async listFiles(params?: {
    channel?: string;
    user?: string;
    types?: string;
    count?: number;
    page?: number;
  }) {
    return this.call<{ files: unknown[]; paging: unknown }>("files.list", params ?? {});
  }

  async getFileInfo(params: { file: string }) {
    return this.call<{ file: unknown }>("files.info", params);
  }

  async deleteFile(params: { file: string }) {
    return this.call("files.delete", params);
  }

  async getUploadURLExternal(params: { filename: string; length: number; alt_txt?: string }) {
    return this.call<{ upload_url: string; file_id: string }>("files.getUploadURLExternal", params);
  }

  async completeUploadExternal(params: {
    files: Array<{ id: string; title?: string }>;
    channel_id?: string;
    initial_comment?: string;
    thread_ts?: string;
  }) {
    return this.call<{ files: unknown[] }>("files.completeUploadExternal", params);
  }

  async uploadFile(params: {
    channels: string;
    content: string;
    filename: string;
    filetype?: string;
    title?: string;
    initial_comment?: string;
    thread_ts?: string;
  }) {
    // Use the legacy files.upload for simplicity (works for text content)
    return this.call<{ file: unknown }>("files.upload", params);
  }

  // ── Reactions ─────────────────────────────────────────────────────────────────

  async addReaction(params: { channel: string; timestamp: string; name: string }) {
    return this.call("reactions.add", params);
  }

  async removeReaction(params: { channel: string; timestamp: string; name: string }) {
    return this.call("reactions.remove", params);
  }

  async getReactions(params: { channel: string; timestamp: string; full?: boolean }) {
    return this.call<{ message: unknown }>("reactions.get", params);
  }

  // ── Pins ─────────────────────────────────────────────────────────────────────

  async listPins(params: { channel: string }) {
    return this.call<{ items: unknown[] }>("pins.list", params);
  }

  async addPin(params: { channel: string; timestamp: string }) {
    return this.call("pins.add", params);
  }

  async removePin(params: { channel: string; timestamp: string }) {
    return this.call("pins.remove", params);
  }

  // ── Reminders ─────────────────────────────────────────────────────────────────

  async listReminders() {
    return this.call<{ reminders: unknown[] }>("reminders.list", {});
  }

  async addReminder(params: { text: string; time: string | number; user?: string }) {
    return this.call<{ reminder: unknown }>("reminders.add", params);
  }

  async deleteReminder(params: { reminder: string }) {
    return this.call("reminders.delete", params);
  }

  async completeReminder(params: { reminder: string }) {
    return this.call("reminders.complete", params);
  }

  // ── Team ──────────────────────────────────────────────────────────────────────

  async getTeamInfo(params?: { team?: string }) {
    return this.call<{ team: unknown }>("team.info", params ?? {});
  }

  // ── Canvases ──────────────────────────────────────────────────────────────────

  async createCanvas(params: { title?: string; document_content?: unknown }) {
    return this.call<{ canvas_id: string }>("canvases.create", params);
  }

  async editCanvas(params: { canvas_id: string; changes: unknown[] }) {
    return this.call("canvases.edit", params);
  }

  async deleteCanvas(params: { canvas_id: string }) {
    return this.call("canvases.delete", params);
  }

  // ── Bookmarks ─────────────────────────────────────────────────────────────────

  async listBookmarks(params: { channel_id: string }) {
    return this.call<{ bookmarks: unknown[] }>("bookmarks.list", params);
  }

  async addBookmark(params: {
    channel_id: string;
    title: string;
    type: string;
    link?: string;
    emoji?: string;
  }) {
    return this.call<{ bookmark: unknown }>("bookmarks.add", params);
  }

  async editBookmark(params: {
    channel_id: string;
    bookmark_id: string;
    title?: string;
    link?: string;
    emoji?: string;
  }) {
    return this.call<{ bookmark: unknown }>("bookmarks.edit", params);
  }

  async removeBookmark(params: { channel_id: string; bookmark_id: string }) {
    return this.call("bookmarks.remove", params);
  }

  // ── User Groups ───────────────────────────────────────────────────────────────

  async listUsergroups(params?: {
    include_disabled?: boolean;
    include_count?: boolean;
    include_users?: boolean;
  }) {
    return this.call<{ usergroups: unknown[] }>("usergroups.list", params ?? {});
  }

  async createUsergroup(params: {
    name: string;
    handle?: string;
    description?: string;
    channels?: string;
  }) {
    return this.call<{ usergroup: unknown }>("usergroups.create", params);
  }

  async updateUsergroup(params: {
    usergroup: string;
    name?: string;
    handle?: string;
    description?: string;
    channels?: string;
  }) {
    return this.call<{ usergroup: unknown }>("usergroups.update", params);
  }

  async listUsergroupMembers(params: { usergroup: string; include_disabled?: boolean }) {
    return this.call<{ users: string[] }>("usergroups.users.list", params);
  }

  async updateUsergroupMembers(params: { usergroup: string; users: string }) {
    return this.call<{ usergroup: unknown }>("usergroups.users.update", params);
  }
}
