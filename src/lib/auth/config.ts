import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope:
            "openid profile email offline_access User.Read Mail.Read",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!account || !profile) return false;

      const allowedTenant = process.env.ALLOWED_TENANT_ID;
      const allowedUser = process.env.ALLOWED_USER_OBJECT_ID;

      const tid = (profile as Record<string, unknown>).tid as
        | string
        | undefined;
      const oid = (profile as Record<string, unknown>).oid as
        | string
        | undefined;

      if (tid !== allowedTenant) {
        console.error(
          `[auth] Rejected sign-in: tenant ${tid ?? "unknown"} is not allowed`
        );
        return false;
      }

      if (oid !== allowedUser) {
        console.error(
          `[auth] Rejected sign-in: user ${oid ?? "unknown"} is not authorized`
        );
        return false;
      }

      return true;
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
});
