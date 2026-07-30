import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { fetchInboxMessages } from "@/lib/graph/messages";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { GraphMessage } from "@/lib/graph/types";

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (diffHours < 168) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function MessageCard({ message }: { message: GraphMessage }) {
  const sender =
    message.from?.emailAddress?.name ||
    message.from?.emailAddress?.address ||
    "Unknown";
  const subject = message.subject || "(No subject)";
  const preview = message.bodyPreview || "";
  const isUnread = message.isRead === false;
  const importance = message.importance || "normal";
  const hasAttachments = message.hasAttachments ?? false;

  return (
    <div
      className={`border-b border-zinc-200 px-4 py-3 dark:border-zinc-700 ${
        isUnread
          ? "bg-blue-50/50 dark:bg-blue-950/20"
          : "bg-white dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isUnread && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
            )}
            {importance === "high" && (
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                !
              </span>
            )}
            <span
              className={`truncate text-sm ${
                isUnread
                  ? "font-semibold text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {sender}
            </span>
            {hasAttachments && (
              <span className="text-xs text-zinc-400" title="Has attachments">
                📎
              </span>
            )}
          </div>
          <div
            className={`mt-0.5 truncate text-sm ${
              isUnread
                ? "font-medium text-zinc-900 dark:text-zinc-100"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {subject}
          </div>
          {preview && (
            <div className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-500">
              {preview.slice(0, 120)}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {formatTime(message.receivedDateTime)}
          </span>
          <a
            href={message.webLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Open in Outlook
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function InboxPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

  let messages: GraphMessage[] = [];
  let error: string | null = null;

  try {
    messages = await fetchInboxMessages(session.accessToken, 10);
  } catch (err) {
    const graphErr = err as { code?: string; message?: string; statusCode?: number };
    if (graphErr.statusCode === 401) {
      error = "Your Microsoft session has expired. Please sign in again.";
    } else if (graphErr.statusCode === 403) {
      error =
        "Access denied. Mail.Read permission may not be granted, or admin approval may be required.";
    } else {
      error = graphErr.message || "Failed to load inbox messages.";
    }
    console.error("[inbox] Graph error:", {
      code: graphErr.code,
      statusCode: graphErr.statusCode,
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Inbox Command Center
          </h1>
          <p className="text-xs text-zinc-500">
            Phase 0 — Permission Proof ({messages.length} messages loaded)
          </p>
        </div>
        <SignOutButton />
      </header>

      <main className="flex-1 overflow-y-auto">
        {error && (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            <p className="font-medium">Error loading messages</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!error && messages.length === 0 && (
          <div className="p-8 text-center text-sm text-zinc-500">
            No messages found in your inbox.
          </div>
        )}

        {messages.map((msg) => (
          <MessageCard key={msg.id} message={msg} />
        ))}
      </main>
    </div>
  );
}
