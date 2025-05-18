// components/common/Navbar.tsx
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { UserRole } from "../../types";
import { useAuth } from "@/context/AuthProvider";

const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Если пользователь не авторизован или происходит загрузка, ничего не показываем
  if (!user || loading) {
    return null;
  }

  const isAdmin = user.role === UserRole.ADMIN;
  const isTeacher = user.role === UserRole.TEACHER;

  // Определяем ссылки для навигации в зависимости от роли пользователя
  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { href: "/admin", label: "Панель управления" },
        { href: "/admin/categories", label: "Категории" },
        { href: "/admin/tests", label: "Тесты" },
        { href: "/admin/users", label: "Пользователи" },
        { href: "/admin/statistics", label: "Статистика" },
      ];
    } else if (isTeacher) {
      return [
        { href: "/teacher", label: "Главная" },
        { href: "/teacher/tests", label: "Доступные тесты" },
        { href: "/teacher/results", label: "Мои результаты" },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                href={isAdmin ? "/admin" : "/teacher"}
                className="text-white font-bold text-xl"
              >
                Система оценки компетенций
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      router.pathname === link.href
                        ? "bg-indigo-700 text-white"
                        : "text-white hover:bg-indigo-500"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-gray-300 mr-4">
                {user.name} ({isAdmin ? "Администратор" : "Преподаватель"})
              </span>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 p-1 rounded-full text-white hover:bg-indigo-800 focus:outline-none"
              >
                <span className="px-3 py-1">Выйти</span>
              </button>
            </div>
          </div>

          {/* Мобильное меню */}
          <div className="md:hidden flex items-center">
            <div className="mr-2">
              <span className="text-gray-300 text-sm">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-indigo-700 p-1 rounded-full text-white hover:bg-indigo-800 focus:outline-none"
            >
              <span className="px-2 py-1 text-sm">Выйти</span>
            </button>
          </div>
        </div>
      </div>

      {/* Мобильная навигация */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname === link.href
                  ? "bg-indigo-700 text-white"
                  : "text-white hover:bg-indigo-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
