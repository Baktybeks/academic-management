import React, { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/common/Layout";

type AdminLayoutProps = {
  children: ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const currentPath = router.pathname;

  return (
    <Layout title="Панель администратора">
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-white font-bold text-xl">
                    Система управления
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <Link
                      href="/admin"
                      className={`${
                        currentPath === "/admin"
                          ? "bg-indigo-700 text-white"
                          : "text-white hover:bg-indigo-500"
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Главная
                    </Link>
                    <Link
                      href="/admin/users"
                      className={`${
                        currentPath === "/admin/users"
                          ? "bg-indigo-700 text-white"
                          : "text-white hover:bg-indigo-500"
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Пользователи
                    </Link>
                    <Link
                      href="/admin/analytics"
                      className={`${
                        currentPath === "/admin/analytics"
                          ? "bg-indigo-700 text-white"
                          : "text-white hover:bg-indigo-500"
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Аналитика
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-white mr-4">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1 rounded-md text-sm"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="py-6 sm:py-12">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </Layout>
  );
};

export default AdminLayout;
