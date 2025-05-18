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
    } catch {
      // Cookie parsing failed, handle as not authenticated
    }
  }

  const isAuthenticated = !!user;
  const isActive = user?.isActive === true;
  const path = request.nextUrl.pathname;
  console.log(isAuthenticated, "isAuthenticated");
  console.log(isActive, "isActive");
  console.log(path, "path");

  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      // Перенаправляем на соответствующую страницу в зависимости от роли
      return redirectByRole(user.role);
    }
    return NextResponse.next();
  }

  // Protected routes - проверяем аутентификацию И активацию
  if (!isAuthenticated || !isActive) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access
  if (path.startsWith("/admin") && user.role !== UserRole.ADMIN) {
    return redirectByRole(user.role);
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

  // Home page redirect based on role
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
