"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { attendanceApi } from "@/services/attendanceService";
import { lessonApi } from "@/services/lessonService";
import { Attendance, Lesson } from "@/types";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function StudentAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<
    Array<Attendance & { lesson?: Lesson }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Получаем данные о посещаемости для текущего студента
        const attendanceRecords = await attendanceApi.getByStudentId(user.$id);

        // Для каждой записи посещаемости получаем информацию об уроке
        const attendanceWithLessons = await Promise.all(
          attendanceRecords.map(async (record) => {
            const lesson = await lessonApi.getLessonById(record.lessonId);
            return { ...record, lesson };
          })
        );

        // Сортируем по дате урока (от новых к старым)
        attendanceWithLessons.sort((a, b) => {
          if (!a.lesson?.date || !b.lesson?.date) return 0;
          return (
            new Date(b.lesson.date).getTime() -
            new Date(a.lesson.date).getTime()
          );
        });

        setAttendanceData(attendanceWithLessons);
      } catch (err) {
        console.error("Ошибка при загрузке данных о посещаемости:", err);
        setError("Не удалось загрузить данные о посещаемости");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  // Форматирование даты
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Нет даты";
    try {
      return format(parseISO(dateString), "dd MMMM yyyy", { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-6">Загрузка данных о посещаемости...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (attendanceData.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        У вас пока нет записей о посещаемости.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Урок
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Присутствие
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Оценка
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attendanceData.map((record) => (
            <tr key={record.$id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(record.lesson?.date)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {record.lesson?.title || "Неизвестный урок"}
                </div>
                {record.lesson?.description && (
                  <div className="text-sm text-gray-500">
                    {record.lesson.description}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    record.present
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {record.present ? "Присутствовал" : "Отсутствовал"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentAttendance;
