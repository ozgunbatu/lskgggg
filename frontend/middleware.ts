import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/pricing",
  "/demo",
  "/agb",
  "/datenschutz",
  "/impressum",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow all /complaints/*, /saq/*, /api/* public routes
  if (
    pathname.startsWith("/complaints/") ||
    pathname.startsWith("/saq/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    PUBLIC_PATHS.some(p => pathname === p)
  ) {
    return NextResponse.next();
  }

  // Protect /app/* routes
  if (pathname.startsWith("/app")) {
    const token =
      req.cookies.get("lksg_token")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
