import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { APP_MODE_COOKIE_KEY, DEFAULT_APP_MODE, isAppMode } from "@/lib/app-mode-config";

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

function getRequestMode(request: NextRequest) {
  const cookieMode = request.cookies.get(APP_MODE_COOKIE_KEY)?.value;
  return isAppMode(cookieMode) ? cookieMode : DEFAULT_APP_MODE;
}

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const mode = getRequestMode(request);

  if (mode === "toolkit") {
    return NextResponse.redirect(new URL("/toolkit", request.url));
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/auth/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
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
