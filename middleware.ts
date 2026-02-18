import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/students",
    "/students/:path*",
    "/checkins",
    "/checkins/:path*",
    "/resources",
    "/resources/:path*",
    "/admin",
    "/admin/:path*",
    "/app",
    "/app/:path*",
  ],
};
