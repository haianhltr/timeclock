import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      const email = (user.email || "").toLowerCase();
      if (!email) return false;

      try {
        const dbAllow = await prisma.allowedEmail.findUnique({
          where: { email },
        });
        if (dbAllow) return true;
      } catch {
        // table missing on fresh DB — fall through to env var
      }

      const raw = process.env.ALLOWED_EMAILS || "";
      const envAllowed = raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (envAllowed.includes(email)) return true;

      return false;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        let role = user.role ?? "USER";
        if (trigger === "signUp") {
          const adminEmail = (process.env.ADMIN_EMAIL || "")
            .trim()
            .toLowerCase();
          if (adminEmail && user.email?.toLowerCase() === adminEmail) {
            await prisma.user.update({
              where: { id: user.id! },
              data: { role: "ADMIN" },
            });
            role = "ADMIN";
          }
        }
        token.role = role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
