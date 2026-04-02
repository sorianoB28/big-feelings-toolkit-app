import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { getSafeCallbackUrl } from "@/lib/auth/redirects";

const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/profile",
  "/students",
  "/checkins",
  "/resources",
  "/admin",
  "/app",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/auth", request.url);
  signInUrl.searchParams.set("callbackUrl", getSafeCallbackUrl(`${pathname}${search}`));
  return NextResponse.redirect(signInUrl);
}

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
