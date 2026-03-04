// ── Shared ────────────────────────────────────────────────────────────────────

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

// ── Messages ──────────────────────────────────────────────────────────────────

export interface Message {
  ts: string;
  type: string;
  user?: string;
  bot_id?: string;
  username?: string;
  text?: string;
  thread_ts?: string;
  reply_count?: number;
  reactions?: Reaction[];
  files?: SlackFile[];
}

// ── Conversations ─────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  name?: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
  is_private: boolean;
  is_archived?: boolean;
  is_member?: boolean;
  is_general?: boolean;
  topic?: { value: string };
  purpose?: { value: string };
  num_members?: number;
  created: number;
  user?: string; // for DMs
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  real_name?: string;
  display_name?: string;
  email?: string;
  title?: string;
  phone?: string;
  status_text?: string;
  status_emoji?: string;
  image_72?: string;
}

export interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
  is_bot: boolean;
  is_admin?: boolean;
  is_owner?: boolean;
  deleted?: boolean;
  profile?: UserProfile;
  tz?: string;
}

// ── Files ─────────────────────────────────────────────────────────────────────

export interface SlackFile {
  id: string;
  name: string;
  title?: string;
  mimetype?: string;
  filetype?: string;
  size?: number;
  url_private?: string;
  permalink?: string;
  channels?: string[];
  created?: number;
  user?: string;
}

// ── Reactions ─────────────────────────────────────────────────────────────────

export interface Reaction {
  name: string;
  count: number;
  users: string[];
}

// ── Pins ──────────────────────────────────────────────────────────────────────

export interface PinItem {
  type: string;
  channel?: string;
  message?: Message;
  file?: SlackFile;
  created?: number;
  created_by?: string;
}

// ── Reminders ─────────────────────────────────────────────────────────────────

export interface Reminder {
  id: string;
  creator: string;
  user: string;
  text: string;
  recurring: boolean;
  time?: number;
  complete_ts?: number;
}

// ── Team ──────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  domain: string;
  email_domain?: string;
  icon?: { image_68?: string };
  enterprise_id?: string;
  enterprise_name?: string;
}

// ── Canvases ──────────────────────────────────────────────────────────────────

export interface Canvas {
  canvas_id: string;
  title?: string;
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  channel_id: string;
  title: string;
  type: string;
  link?: string;
  emoji?: string;
  date_created?: number;
}

// ── User Groups ───────────────────────────────────────────────────────────────

export interface UserGroup {
  id: string;
  name: string;
  handle: string;
  description?: string;
  is_external?: boolean;
  date_create?: number;
  user_count?: number;
  users?: string[];
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchMessage {
  iid: string;
  ts: string;
  text: string;
  username: string;
  channel: { id: string; name: string };
  permalink: string;
}

export interface SearchFile {
  id: string;
  name: string;
  title?: string;
  mimetype?: string;
  permalink?: string;
  channels?: string[];
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface ResponseMetadata {
  next_cursor?: string;
}
