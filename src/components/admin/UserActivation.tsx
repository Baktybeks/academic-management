// components/admin/UserActivation.tsx (обновленная версия)
import React from "react";
import { usePendingUsers, useActivateUser } from "@/services/authService";
import { User } from "@/types";

const UserActivation: React.FC = () => {
  const { data: inactiveUsers = [], isLoading: loading } = usePendingUsers();
  const activateUserMutation = useActivateUser();
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleActivateUser = async (userId: string) => {
    try {
      setSuccess(null);

      await activateUserMutation.mutateAsync(userId);

      setSuccess("Пользователь успешно активирован");

      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error("Ошибка активации пользователя:", err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Активация пользователей</h2>

      {activateUserMutation.error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">
            {(activateUserMutation.error as Error).message ||
              "Ошибка активации пользователя"}
          </span>
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

      {loading && (
        <p className="text-gray-500">
          Загрузка неактивированных пользователей...
        </p>
      )}

      {!loading && inactiveUsers.length === 0 && (
        <p className="text-gray-500">Нет пользователей, ожидающих активации</p>
      )}

      {!loading && inactiveUsers.length > 0 && (
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
                  Дата регистрации
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {inactiveUsers.map((user: User) => (
                <tr key={user.$id}>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {user.name}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {user.email}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <button
                      onClick={() => handleActivateUser(user.$id!)}
                      disabled={
                        activateUserMutation.isPending &&
                        activateUserMutation.variables === user.$id
                      }
                      className={`bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm ${
                        activateUserMutation.isPending &&
                        activateUserMutation.variables === user.$id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {activateUserMutation.isPending &&
                      activateUserMutation.variables === user.$id
                        ? "Активация..."
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
};

export default UserActivation;
