// middleware.ts - расположение остается тем же, на уровне src/
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types";

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get("auth-storage");
  let user = null;

  if (authSession) {
    try {
      const parsed = JSON.parse(authSession.value);
      user = parsed.state?.user;
    } catch {}
  }

  const isAuthenticated = !!user;
  const isActive = user?.isActive === true;
  const path = request.nextUrl.pathname;

  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      return redirectByRole(user.role);
    }
    return NextResponse.next();
  }

  if (!isAuthenticated || !isActive) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access
  if (path.startsWith("/admin") && user.role !== UserRole.ADMIN) {
    return redirectByRole(user.role);
  }

  if (path.startsWith("/curator") && user.role !== UserRole.CURATOR) {
    return redirectByRole(user.role);
  }

  if (path.startsWith("/teacher") && user.role !== UserRole.TEACHER) {
    return redirectByRole(user.role);
  }

  if (path.startsWith("/student") && user.role !== UserRole.STUDENT) {
    return redirectByRole(user.role);
  }

  if (path === "/") {
    return redirectByRole(user.role);
  }

  return NextResponse.next();
}

function redirectByRole(role: UserRole) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  let path: string;
  switch (role) {
    case UserRole.ADMIN:
      path = "/admin";
      break;
    case UserRole.CURATOR:
      path = "/curator";
      break;
    case UserRole.TEACHER:
      path = "/teacher";
      break;
    case UserRole.STUDENT:
      path = "/student";
      break;
    default:
      path = "/login";
  }

  return NextResponse.redirect(new URL(path, baseUrl));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|public|favicon.ico).*)",
    "/admin/:path*",
    "/curator/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/login",
    "/register",
    "/",
  ],
};
