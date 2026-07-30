import { describe, it, expect, vi, beforeEach } from "vitest";
import { GraphClient } from "@/lib/graph/client";

describe("GraphClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches Bearer token to requests", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ value: [] }), { status: 200 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const client = new GraphClient("test-access-token");
    await client.fetch("/me/messages");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer test-access-token");
  });

  it("attaches Prefer: IdType=\"ImmutableId\" header by default", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ value: [] }), { status: 200 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const client = new GraphClient("test-token");
    await client.fetch("/me/mailFolders/inbox/messages");

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Prefer).toContain('IdType="ImmutableId"');
  });

  it("includes text body preference when requested", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ value: [] }), { status: 200 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const client = new GraphClient("test-token");
    await client.fetch("/me/messages", { preferTextBody: true });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Prefer).toContain('outlook.body-content-type="text"');
  });

  it("does not attach immutable ID header when disabled", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ value: [] }), { status: 200 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const client = new GraphClient("test-token");
    await client.fetch("/me/messages", { useImmutableId: false });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Prefer).toBeUndefined();
  });

  it("prepends Graph base URL for relative paths", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const client = new GraphClient("test-token");
    await client.fetch("/me/messages");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("https://graph.microsoft.com/v1.0/me/messages");
  });

  it("uses absolute URL as-is", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );
    vi.stubGlobal("fetch", mockFetch);

    const client = new GraphClient("test-token");
    await client.fetch("https://graph.microsoft.com/v1.0/me/messages?$skip=10");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(
      "https://graph.microsoft.com/v1.0/me/messages?$skip=10"
    );
  });

  it("throws a GraphError on 403", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "ErrorAccessDenied",
            message: "Access is denied.",
          },
        }),
        { status: 403 }
      )
    );
    vi.stubGlobal("fetch", mockFetch);

    const client = new GraphClient("test-token");
    await expect(client.fetch("/me/messages")).rejects.toMatchObject({
      code: "ErrorAccessDenied",
      statusCode: 403,
    });
  });

  it("does not expose access token in error objects", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "Unauthorized", message: "Token expired" },
        }),
        { status: 401 }
      )
    );
    vi.stubGlobal("fetch", mockFetch);

    const client = new GraphClient("super-secret-token");
    try {
      await client.fetch("/me/messages");
    } catch (err) {
      const errorStr = JSON.stringify(err);
      expect(errorStr).not.toContain("super-secret-token");
    }
  });
});
