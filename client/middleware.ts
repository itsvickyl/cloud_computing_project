import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { getToken } from 'next-auth/jwt';

const PROTECTED_ROUTES = [
  "/my-applications",
  "/my-job-applications",
  "/my-jobs",
  "/post-job",
  "/favorites",
];

const AUTH_PAGES = ["/login", "/register"];

const SKIP_PATTERNS = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/sitemap.xml",
  "/robots.txt",
  "/.well-known",
  "/public",
  "/static",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    SKIP_PATTERNS.some((pattern) => pathname.startsWith(pattern)) ||
    pathname.includes(".") ||
    pathname.endsWith(".map")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/job/") && pathname.split("/").length === 3) {
    return NextResponse.next();
  }

  // Only fetch token if this route actually needs authentication
  const needsAuth = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!needsAuth && !isAuthPage) {
    return NextResponse.next();
  }

  const token = req.cookies.get(process.env.AUTH_COOKIE_TOKEN_NAME || "");

  // const token = await getToken({
  //   req,
  //   secret: process.env.AUTH_SECRET,
  //   secureCookie: process.env.NODE_ENV === "production",
  // });

  if (!token && needsAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // if (token && needsAuth && !token.onboardingComplete) {
  //   const url = req.nextUrl.clone();
  //   url.pathname = '/register';
  //   url.searchParams.set('new', 'true');
  //   url.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(url);
  // }

  if (token && isAuthPage) {
    // if (pathname === '/register' && !token.onboardingComplete) {
    //   return NextResponse.next();
    // }

    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)"],
};
