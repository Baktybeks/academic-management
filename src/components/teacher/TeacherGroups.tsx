"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { groupApi } from "@/services/groupService";
import { Group } from "@/types";
import Link from "next/link";

export function TeacherGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      // Проверяем наличие user и user.$id
      if (!user || !user.$id) {
        setLoading(false);
        setError("Не удалось получить информацию о пользователе");
        return;
      }

      try {
        setLoading(true);
        const teacherGroups = await groupApi.getGroupsByTeacherId(user.$id);
        setGroups(teacherGroups);
      } catch (err) {
        console.error("Ошибка при загрузке групп:", err);
        setError("Не удалось загрузить ваши группы");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  if (loading) {
    return <div className="text-center py-6">Загрузка групп...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        У вас нет назначенных групп. Обратитесь к куратору для назначения
        группы.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Мои группы</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(
          (group) =>
            // Проверяем наличие group.$id в ключе и ссылках
            group.$id && (
              <div
                key={group.$id}
                className="bg-white shadow-md rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{group.title}</h3>

                  <div className="mt-4 flex space-x-2">
                    <Link
                      href={`/teacher/lessons/${group.$id}`}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      Уроки
                    </Link>
                    <Link
                      href={`/teacher/attendance/${group.$id}`}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      Посещаемость
                    </Link>
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}

export default TeacherGroups;
