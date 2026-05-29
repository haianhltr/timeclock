import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: "USER" | "ADMIN";
  }

  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }
}
