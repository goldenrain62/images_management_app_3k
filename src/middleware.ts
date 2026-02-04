import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // You can add additional logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true if user is authenticated (has a token)
        return !!token;
      },
    },
    pages: {
      signIn: "/signin",
    },
  }
);

// Protect all routes except public ones
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - signin, signup, reset-password (auth pages)
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!signin|signup|reset-password|api/auth|api/categories$|api/categories/[^/]+/images$|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
