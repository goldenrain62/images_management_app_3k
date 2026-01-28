import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb"; // Your MongoDB connection utility
import User from "@/models/User"; // Your User model

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
          // Connect to database
          await dbConnect();

          // Find user by email and populate role
          const user = await User.findOne({ email: credentials.email })
            .populate("role")
            .lean();

          if (!user) {
            throw new Error("Email hoặc mật khẩu không đúng");
          }

          // Check if user is active
          if (user.isActive === 0) {
            throw new Error("Tài khoản đã bị vô hiệu hóa");
          }

          // Verify password
          // Note: You'll need to get the non-lean document to use methods
          const userDoc = await User.findOne({ email: credentials.email });
          const isPasswordValid = await userDoc.comparePassword(
            credentials.password,
          );

          if (!isPasswordValid) {
            throw new Error("Email hoặc mật khẩu không đúng");
          }

          // Return user object (will be stored in JWT)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role.name, // Include role info
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
    async jwt({ token, user, trigger }) {
      // On sign in, add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role.name;
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
        session.user.isActive = token.isActive as number;
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
