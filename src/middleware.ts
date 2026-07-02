import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, ADMIN_COOKIE_NAME, CONTRACTOR_COOKIE_NAME } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/submit", "/thank-you", "/api/admin/login", "/api/contractor/login", "/api/jobs"];

// Login pages must be reachable without auth (otherwise infinite redirect loop)
const LOGIN_PAGES = ["/admin/login", "/contractor/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths + Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // Always allow login pages themselves
  if (LOGIN_PAGES.includes(pathname)) {
    return NextResponse.next();
  }

  // Admin routes (except /admin/login which is allowed above)
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Contractor routes (except /contractor/login which is allowed above)
  if (pathname.startsWith("/contractor")) {
    const token = req.cookies.get(CONTRACTOR_COOKIE_NAME)?.value;
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "contractor") {
      const url = req.nextUrl.clone();
      url.pathname = "/contractor/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
