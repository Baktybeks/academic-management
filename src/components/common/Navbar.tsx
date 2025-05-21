"use client"; // Добавляем это, так как используем хуки React

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Обновляем импорт
import { UserRole } from "@/types";
import { useAuth } from "@/hooks/useAuth"; // Обновляем путь импорта
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Вместо router.pathname

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    // Перенаправление будет обрабатываться middleware
  };

  // Если пользователь не авторизован или происходит загрузка, ничего не показываем
  if (!user || loading) {
    return null;
  }

  const isAdmin = user.role === UserRole.ADMIN;
  const isTeacher = user.role === UserRole.TEACHER;
  const isCurator = user.role === UserRole.CURATOR;
  const isStudent = user.role === UserRole.STUDENT;

  // Определяем ссылки для навигации в зависимости от роли пользователя
  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { href: "/admin", label: "Панель управления" },
        { href: "/admin/curators", label: "Кураторы" }, // Добавлена новая ссылка
      ];
    }

    if (isTeacher) {
      return [{ href: "/teacher", label: "Мои группы" }];
    }

    if (isCurator) {
      return [
        { href: "/curator", label: "Главная" },
        { href: "/curator/groups", label: "Группы" },
        { href: "/curator/users", label: "Пользователи" }, // Теперь один пункт вместо двух
        { href: "/curator/lessons", label: "Уроки" },
        { href: "/curator/surveys", label: "Опросники" },
      ];
    }

    if (isStudent) {
      return [
        { href: "/student", label: "Главная" },
        { href: "/student/attendance", label: "Посещаемость" },
        { href: "/student/grades", label: "Оценки" },
        { href: "/student/surveys", label: "Опросники" },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  // Функция для определения активного пути
  const isActive = (href: string) => {
    if (
      href === "/admin" ||
      href === "/teacher" ||
      href === "/curator" ||
      href === "/student"
    ) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                href={
                  isAdmin
                    ? "/admin"
                    : isTeacher
                    ? "/teacher"
                    : isCurator
                    ? "/curator"
                    : "/student"
                }
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
                      isActive(link.href)
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
                {user.name} (
                {isAdmin
                  ? "Администратор"
                  : isTeacher
                  ? "Преподаватель"
                  : isCurator
                  ? "Куратор"
                  : "Студент"}
                )
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
                isActive(link.href)
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
}

export default Navbar;
