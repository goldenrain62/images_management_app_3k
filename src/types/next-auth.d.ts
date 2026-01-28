import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

// Define your Role interface (adjust based on your actual Role model)
interface Role {
  _id: string;
  name: string;
  // Add other role properties as needed
}

declare module "next-auth" {
  /**
   * Extend the built-in User type
   */
  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    role: Role;
    isActive: number;
  }

  /**
   * Extend the built-in Session type
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isActive: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT type
   */
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: number;
  }
}
