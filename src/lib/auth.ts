import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu");
        }

        try {
          // Find user by email with role join
          const result = await db
            .select({
              id: users.id,
              email: users.email,
              password: users.password,
              name: users.name,
              isActive: users.isActive,
              roleName: roles.name,
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.email, credentials.email))
            .limit(1);

          const user = result[0];

          if (!user) {
            throw new Error("Email hoặc mật khẩu không đúng");
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error("Tài khoản đã bị vô hiệu hóa");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isPasswordValid) {
            throw new Error("Email hoặc mật khẩu không đúng");
          }

          // Return user object (will be stored in JWT)
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.roleName,
            isActive: user.isActive,
          };
        } catch (error: any) {
          throw new Error(error.message || "Đăng nhập thất bại");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt", // Use JWT instead of database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    // JWT callback: runs when JWT is created or updated
    async jwt({ token, user }) {
      // On sign in, add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.isActive = user.isActive;
      }

      return token;
    },

    // Session callback: runs when session is accessed
    async session({ session, token }) {
      // Add token data to session object
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as any;
        session.user.isActive = token.isActive as boolean;
      }

      return session;
    },
  },

  pages: {
    signIn: "/signin", // Your custom sign-in page
    error: "/signin", // Redirect errors to sign-in page
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
};
