import { describe, expect, it } from "bun:test";
import { SlackApiError, SlackClient } from "../../../src/client/slack.js";

const TEST_CONFIG = {
  SLACK_BOT_TOKEN: "xoxb-test-bot-token",
  SLACK_USER_TOKEN: "xoxp-test-user-token",
};

function makeOkFetcher(body: unknown): typeof fetch {
  return async () => new Response(JSON.stringify({ ok: true, ...body as object }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
}

function makeErrorFetcher(slackError: string): typeof fetch {
  return async () => new Response(JSON.stringify({ ok: false, error: slackError }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
}

function makeCaptureFetcher(body: unknown): { fetcher: typeof fetch; requests: Request[] } {
  const requests: Request[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    requests.push(new Request(input instanceof Request ? input.url : String(input), init));
    return new Response(JSON.stringify({ ok: true, ...body as object }), { status: 200 });
  };
  return { fetcher, requests };
}

describe("SlackClient", () => {
  describe("authentication", () => {
    it("sends bot token by default", async () => {
      const headers: string[] = [];
      const fetcher: typeof fetch = async (_input, init) => {
        headers.push(new Headers(init?.headers).get("authorization") ?? "");
        return new Response(JSON.stringify({ ok: true, ts: "123", channel: "C1" }), { status: 200 });
      };
      const client = new SlackClient(TEST_CONFIG, fetcher);
      await client.postMessage({ channel: "C1", text: "hi" });
      expect(headers[0]).toBe("Bearer xoxb-test-bot-token");
    });

    it("sends user token for search", async () => {
      const headers: string[] = [];
      const fetcher: typeof fetch = async (_input, init) => {
        headers.push(new Headers(init?.headers).get("authorization") ?? "");
        return new Response(JSON.stringify({ ok: true, messages: { matches: [], total: 0, pagination: {} } }), { status: 200 });
      };
      const client = new SlackClient(TEST_CONFIG, fetcher);
      await client.searchMessages({ query: "test" });
      expect(headers[0]).toBe("Bearer xoxp-test-user-token");
    });
  });

  describe("error handling", () => {
    it("throws SlackApiError on ok:false", async () => {
      const client = new SlackClient(TEST_CONFIG, makeErrorFetcher("channel_not_found"));
      await expect(client.postMessage({ channel: "X", text: "hi" })).rejects.toBeInstanceOf(SlackApiError);
    });

    it("includes error code", async () => {
      const client = new SlackClient(TEST_CONFIG, makeErrorFetcher("not_authed"));
      try {
        await client.listConversations();
      } catch (e) {
        expect((e as SlackApiError).errorCode).toBe("not_authed");
      }
    });
  });

  describe("postMessage", () => {
    it("calls chat.postMessage", async () => {
      const { fetcher, requests } = makeCaptureFetcher({ ts: "123", channel: "C1" });
      const client = new SlackClient(TEST_CONFIG, fetcher);
      await client.postMessage({ channel: "C1", text: "Hello!" });
      expect(requests[0]?.url).toContain("chat.postMessage");
    });

    it("returns ts and channel", async () => {
      const client = new SlackClient(TEST_CONFIG, makeOkFetcher({ ts: "1711480000.0", channel: "C001" }));
      const result = await client.postMessage({ channel: "C001", text: "hi" });
      expect(result.ts).toBe("1711480000.0");
      expect(result.channel).toBe("C001");
    });
  });

  describe("listConversations", () => {
    it("calls conversations.list", async () => {
      const { fetcher, requests } = makeCaptureFetcher({ channels: [], response_metadata: {} });
      const client = new SlackClient(TEST_CONFIG, fetcher);
      await client.listConversations({ limit: 50 });
      expect(requests[0]?.url).toContain("conversations.list");
    });
  });

  describe("listUsers", () => {
    it("calls users.list", async () => {
      const { fetcher, requests } = makeCaptureFetcher({ members: [], response_metadata: {} });
      const client = new SlackClient(TEST_CONFIG, fetcher);
      await client.listUsers();
      expect(requests[0]?.url).toContain("users.list");
    });
  });
});
