// pages/admin/users.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  usePendingUsers,
  useActivateUser,
  useAllUsers,
} from "@/services/authService";
import { User, UserRole } from "@/types";
import Layout from "@/components/common/Layout";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

const UsersManagementPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    data: pendingUsers,
    isLoading: pendingLoading,
    refetch: refetchPendingUsers,
  } = usePendingUsers();
  const { data: allUsers, isLoading: allUsersLoading } = useAllUsers();
  const activateUserMutation = useActivateUser();

  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  // Проверка прав доступа
  React.useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleActivate = async (userId: string) => {
    try {
      await activateUserMutation.mutateAsync(userId);

      // Показываем уведомление об успешной активации
      toast.success("Пользователь успешно активирован");

      // Обновляем список неактивированных пользователей
      refetchPendingUsers();
    } catch (error) {
      // Обработка ошибки
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ошибка при активации пользователя";
      toast.error(errorMessage);
    }
  };

  // Функция для фильтрации пользователей по роли
  const filterUsersByRole = (users: User[] | undefined, role?: UserRole) => {
    if (!users) return [];
    return role ? users.filter((user) => user.role === role) : users;
  };

  // Отображение загрузки
  if (
    authLoading ||
    (activeTab === "pending" && pendingLoading) ||
    (activeTab === "all" && allUsersLoading)
  ) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Управление пользователями</h1>
        {/* Табы */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "pending"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Ожидают активации{" "}
            {pendingUsers && pendingUsers.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full ml-2">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "all"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("all")}
          >
            Все пользователи
          </button>
        </div>

        {/* Неактивированные пользователи */}
        {activeTab === "pending" && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Пользователи, ожидающие активации
            </h2>

            {pendingUsers && pendingUsers.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <li key={user.$id}>
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            Роль:{" "}
                            {user.role === UserRole.TEACHER
                              ? "Преподаватель"
                              : user.role === UserRole.CURATOR
                              ? "Куратор"
                              : user.role === UserRole.STUDENT
                              ? "Студент"
                              : "Администратор"}
                          </p>
                        </div>
                        <div>
                          <button
                            onClick={() => handleActivate(user.$id)}
                            disabled={activateUserMutation.isPending}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                          >
                            {activateUserMutation.isPending
                              ? "Активация..."
                              : "Активировать"}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">
                  Нет пользователей, ожидающих активации.
                </p>
              </div>
            )}
          </>
        )}

        {/* Все пользователи */}
        {activeTab === "all" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Все пользователи</h2>

            {allUsers && allUsers.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {allUsers.map((user) => (
                    <li key={user.$id}>
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="mt-1">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.role === UserRole.ADMIN
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === UserRole.CURATOR
                                  ? "bg-blue-100 text-blue-800"
                                  : user.role === UserRole.TEACHER
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {user.role === UserRole.ADMIN
                                ? "Администратор"
                                : user.role === UserRole.CURATOR
                                ? "Куратор"
                                : user.role === UserRole.TEACHER
                                ? "Преподаватель"
                                : "Студент"}
                            </span>
                            <span
                              className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                user.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.isActive ? "Активирован" : "Не активирован"}
                            </span>
                          </div>
                        </div>
                        {!user.isActive && (
                          <div>
                            <button
                              onClick={() => handleActivate(user.$id)}
                              disabled={activateUserMutation.isPending}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                            >
                              {activateUserMutation.isPending
                                ? "Активация..."
                                : "Активировать"}
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">Пользователи не найдены.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersManagementPage;
