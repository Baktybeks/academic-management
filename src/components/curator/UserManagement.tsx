// components/curator/UserManagement.tsx
"use client";

import React, { useEffect, useState } from "react";
import { userApi } from "@/services/userService";
import { User, UserRole } from "@/types";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Загрузка пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await userApi.getAllUsers();
        // Фильтруем пользователей, исключая администраторов
        const filteredUsers = allUsers.filter(
          (user) => user.role !== UserRole.ADMIN
        );
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Ошибка при загрузке пользователей:", err);
        setError("Не удалось загрузить список пользователей");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Обработчик изменения статуса активации пользователя
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setSuccess(null);
      setError(null);
      setProcessing(userId);

      const updatedUser = currentStatus
        ? await userApi.deactivateUser(userId)
        : await userApi.activateUser(userId);

      // Обновляем список пользователей
      setUsers((prev) =>
        prev.map((user) =>
          user.$id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );

      setSuccess(
        `Пользователь успешно ${currentStatus ? "заблокирован" : "активирован"}`
      );

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error("Ошибка изменения статуса пользователя:", err);
      setError(err.message || "Ошибка при выполнении операции");
    } finally {
      setProcessing(null);
    }
  };

  // Функция для отображения роли пользователя
  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.TEACHER:
        return "Преподаватель";
      case UserRole.CURATOR:
        return "Куратор";
      case UserRole.STUDENT:
        return "Студент";
      default:
        return role;
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Управление пользователями</h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      {loading && <p className="text-gray-500">Загрузка пользователей...</p>}

      {!loading && users.length === 0 && (
        <p className="text-gray-500">Нет пользователей для отображения</p>
      )}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата регистрации
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: User) => (
                <tr
                  key={user.$id}
                  className={!user.isActive ? "bg-gray-50" : ""}
                >
                  <td className="py-2 px-4 border-b border-gray-200">
                    {user.name}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {user.email}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {getRoleName(user.role)}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Активен" : "Заблокирован"}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <button
                      onClick={() =>
                        handleToggleStatus(user.$id!, user.isActive)
                      }
                      disabled={processing === user.$id}
                      className={`text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm ${
                        user.isActive
                          ? "bg-red-500 hover:bg-red-700"
                          : "bg-green-500 hover:bg-green-700"
                      } ${
                        processing === user.$id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {processing === user.$id
                        ? "Обработка..."
                        : user.isActive
                        ? "Заблокировать"
                        : "Активировать"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
