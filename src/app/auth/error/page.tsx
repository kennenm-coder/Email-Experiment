import Link from "next/link";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  const messages: Record<string, string> = {
    AccessDenied:
      "Access denied. Your Microsoft account is not authorized for this application. " +
      "Only the configured tenant and user are allowed.",
    Configuration:
      "There is a configuration problem. Check that all environment variables are set correctly.",
    Default: "An authentication error occurred. Please try signing in again.",
  };

  const message = messages[error ?? ""] ?? messages.Default;

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="mx-auto max-w-sm text-center">
        <h1 className="text-xl font-bold text-red-600 dark:text-red-400">
          Authentication Error
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
        {error && (
          <p className="mt-2 text-xs text-zinc-400">Error code: {error}</p>
        )}
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
