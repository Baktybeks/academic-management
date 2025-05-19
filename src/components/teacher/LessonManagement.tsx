"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { lessonApi } from "@/services/lessonService";
import { groupApi } from "@/services/groupService";
import { Lesson, Group } from "@/types";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";

interface LessonManagementProps {
  groupId: string;
}

export function LessonManagement({ groupId }: LessonManagementProps) {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Состояния для формы создания урока
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonDate, setLessonDate] = useState("");
  const [processingLesson, setProcessingLesson] = useState(false);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !groupId) return;

      try {
        setLoading(true);

        // Загружаем информацию о группе
        const groupData = await groupApi.getGroupById(groupId);
        if (!groupData) {
          setError("Группа не найдена");
          return;
        }

        // Проверяем, является ли преподаватель назначенным для этой группы
        if (groupData.teacherId !== user.$id) {
          setError("У вас нет доступа к этой группе");
          return;
        }

        setGroup(groupData);

        // Загружаем уроки для этой группы
        const lessonsData = await lessonApi.getLessonsByGroup(groupId);
        setLessons(lessonsData);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, groupId]);

  // Обработчик создания урока
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonTitle.trim()) {
      setError("Название урока не может быть пустым");
      return;
    }

    if (!lessonDate) {
      setError("Необходимо указать дату урока");
      return;
    }

    if (!user || !group) {
      setError("Ошибка доступа");
      return;
    }

    try {
      setProcessingLesson(true);
      setError(null);

      // Создаем новый урок
      const newLesson = await lessonApi.createLesson({
        title: lessonTitle,
        description: lessonDescription,
        date: lessonDate,
        groupId: groupId,
        teacherId: user.$id,
      });

      // Обновляем список уроков
      setLessons([...lessons, newLesson]);

      // Сбрасываем форму
      setLessonTitle("");
      setLessonDescription("");
      setLessonDate("");
      setShowCreateForm(false);

      setSuccess("Урок успешно создан");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при создании урока:", err);
      setError(err.message || "Ошибка при создании урока");
    } finally {
      setProcessingLesson(false);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMMM yyyy", { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  // Отображение формы создания урока
  const renderLessonForm = () => (
    <form
      onSubmit={handleCreateLesson}
      className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200"
    >
      <h3 className="text-lg font-bold mb-4">Создание нового урока</h3>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="lessonTitle"
        >
          Название урока
        </label>
        <input
          id="lessonTitle"
          type="text"
          placeholder="Введите название урока"
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="lessonDescription"
        >
          Описание урока (необязательно)
        </label>
        <textarea
          id="lessonDescription"
          placeholder="Введите описание урока"
          value={lessonDescription}
          onChange={(e) => setLessonDescription(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows={3}
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="lessonDate"
        >
          Дата урока
        </label>
        <input
          id="lessonDate"
          type="date"
          value={lessonDate}
          onChange={(e) => setLessonDate(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={processingLesson}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {processingLesson ? "Создание..." : "Создать урок"}
        </button>

        <button
          type="button"
          onClick={() => setShowCreateForm(false)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Отмена
        </button>
      </div>
    </form>
  );

  if (loading) {
    return <div className="text-center py-6">Загрузка данных...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Уроки для группы: {group?.title || "Загрузка..."}
        </h2>

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Создать урок
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      {showCreateForm && renderLessonForm()}

      {lessons.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          Уроков для этой группы пока нет. Создайте первый урок!
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lessons.map((lesson) => (
                <tr key={lesson.$id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lesson.title}
                    </div>
                    {lesson.description && (
                      <div className="text-sm text-gray-500">
                        {lesson.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(lesson.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/teacher/attendance/lesson/${lesson.$id}`}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                      Отметить посещаемость
                    </Link>
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

export default LessonManagement;
