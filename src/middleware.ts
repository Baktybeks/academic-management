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
    } catch (error) {
      // Добавляем логирование ошибки для отладки
      console.error("Ошибка при разборе auth-session:", error);
    }
  }

  const isAuthenticated = !!user;
  const isActive = user?.isActive === true;
  const path = request.nextUrl.pathname;

  // Используем тот же подход к URL для всех редиректов
  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      return redirectByRole(user.role, request);
    }
    return NextResponse.next();
  }

  if (!isAuthenticated || !isActive) {
    // Используем тот же метод создания URL, что и в redirectByRole
    const loginUrl = new URL(request.nextUrl.origin);
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access
  if (path.startsWith("/admin") && user.role !== UserRole.ADMIN) {
    return redirectByRole(user.role, request);
  }

  if (path.startsWith("/curator") && user.role !== UserRole.CURATOR) {
    return redirectByRole(user.role, request);
  }

  if (path.startsWith("/teacher") && user.role !== UserRole.TEACHER) {
    return redirectByRole(user.role, request);
  }

  if (path.startsWith("/student") && user.role !== UserRole.STUDENT) {
    return redirectByRole(user.role, request);
  }

  if (path === "/") {
    return redirectByRole(user.role, request);
  }

  return NextResponse.next();
}

function redirectByRole(role: UserRole, request: NextRequest) {
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
  const url = new URL(request.nextUrl.origin);
  url.pathname = path;

  return NextResponse.redirect(url);
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
