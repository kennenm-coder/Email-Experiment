import { auth } from "@/lib/auth/config";

export async function getSession() {
  const session = await auth();
  if (!session?.accessToken) {
    return null;
  }
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
