import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const LOGIN_ROLES = [
  "ATHLETE",
  "COACH",
  "VENUE_MANAGER",
  "DISTRICT_OFFICER",
  "ADMIN",
  "GOV_ADMIN",
  "TOURNAMENT_ORGANIZER",
] as const;

const loginRoleSchema = z.enum(LOGIN_ROLES);

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

if (!authSecret) {
  throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is not set in environment variables");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
            role: loginRoleSchema,
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password, role } = parsed.data;

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.isActive || user.role !== role) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.email.split("@")[0],
            role: user.role,
          };
        } catch (error) {
          console.error("[auth] database error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }

      // Refresh role from DB when session is updated (e.g. after portal switch)
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isActive: true },
        });
        if (dbUser?.isActive) token.role = dbUser.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
