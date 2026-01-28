import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin", // Where to send users if they aren't logged in
  },
});

export const config = {
  // This Regex tells the middleware to protect EVERYTHING EXCEPT:
  // 1. /api/categories and /api/images
  // 2. The /login page itself
  // 3. Static Next.js files (images, css, js)
  matcher: [
    "/((?!api/categories|api/images|login|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp)$|public).*)",
  ],
};
