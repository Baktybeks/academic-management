"use client";

import React, { useState } from "react";
import { User, UserRole } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { authKeys } from "@/services/authService";
import { databases } from "@/services/appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Query } from "appwrite";
import { useAuth } from "@/hooks/useAuth";

export function CuratorsList() {
  const { deactivateUser, activateUser } = useAuth();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Запрос на получение всех кураторов
  const {
    data: curators = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [...authKeys.users(), "curators"],
    queryFn: async () => {
      try {
        const result = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.users,
          [Query.equal("role", UserRole.CURATOR)]
        );
        return result.documents as unknown as User[];
      } catch (error) {
        console.error("Ошибка при получении списка кураторов:", error);
        return [];
      }
    },
  });

  // Обработчик изменения статуса активации куратора
  const handleToggleActivation = async (userId: string, isActive: boolean) => {
    try {
      setProcessingId(userId);
      setError(null);
      setSuccess(null);

      if (isActive) {
        await deactivateUser(userId);
        setSuccess("Куратор успешно деактивирован");
      } else {
        await activateUser(userId);
        setSuccess("Куратор успешно активирован");
      }

      // Обновляем список кураторов
      refetch();

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error("Ошибка при изменении статуса куратора:", err);
      setError(err.message || "Произошла ошибка");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Список кураторов</h2>

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

      {isLoading ? (
        <p className="text-gray-500">Загрузка списка кураторов...</p>
      ) : curators.length === 0 ? (
        <p className="text-gray-500">Нет созданных кураторов</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ФИО
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {curators.map((curator) => (
                <tr
                  key={curator.$id}
                  className={!curator.isActive ? "bg-gray-50" : ""}
                >
                  <td className="py-2 px-4 border-b border-gray-200">
                    {curator.name}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {curator.email}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        curator.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {curator.isActive ? "Активен" : "Заблокирован"}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <button
                      onClick={() =>
                        handleToggleActivation(curator.$id!, curator.isActive)
                      }
                      disabled={processingId === curator.$id}
                      className={`text-white font-bold py-1 px-2 rounded text-xs ${
                        curator.isActive
                          ? "bg-red-500 hover:bg-red-700"
                          : "bg-green-500 hover:bg-green-700"
                      } ${
                        processingId === curator.$id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {processingId === curator.$id
                        ? "Обработка..."
                        : curator.isActive
                        ? "Блокировать"
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

export default CuratorsList;
