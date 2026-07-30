import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/auth/sign-in-button";

export default async function Home() {
  const session = await auth();

  if (session?.accessToken) {
    redirect("/inbox");
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="mx-auto max-w-sm text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Inbox Command Center
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in with your Microsoft work account to get started.
        </p>
        <SignInButton />
      </div>
    </div>
  );
}
