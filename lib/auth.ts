import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });
        if (!user || user.status !== "active") return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.fullName,
          roleId: user.roleId.toString(),
          roleName: user.role.roleName,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // token.sub already holds the user id, but keep it explicit so the
        // session callback doesn't depend on NextAuth internals.
        token.userId = user.id;
        token.roleId = user.roleId;
        token.roleName = user.roleName;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // Without this, session.user.id is undefined and every API route that
        // scopes data by the current user would reject the request as 401.
        session.user.id = (token.userId as string) ?? (token.sub as string);
        session.user.roleId = token.roleId as string;
        session.user.roleName = token.roleName as string;
      }
      return session;
    },
  },
});
