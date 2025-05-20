"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { attendanceApi } from "@/services/attendanceService";
import { lessonApi } from "@/services/lessonService";
import { groupApi } from "@/services/groupService";
import { Attendance, Lesson } from "@/types";

export function StudentGrades() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<
    Array<Attendance & { lesson?: Lesson | null }>
  >([]);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [attendanceRate, setAttendanceRate] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user || !user.$id) {
        setLoading(false);
        setError("Не удалось получить информацию о пользователе");
        return;
      }

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

        // Рассчитываем среднюю оценку
        const totalScore = attendanceWithLessons.reduce(
          (sum, record) => sum + record.score,
          0
        );
        const avgScore =
          attendanceWithLessons.length > 0
            ? totalScore / attendanceWithLessons.length
            : 0;
        setAverageScore(avgScore);

        // Рассчитываем процент посещаемости
        const attendedCount = attendanceWithLessons.filter(
          (record) => record.present
        ).length;
        const attendancePercentage =
          attendanceWithLessons.length > 0
            ? (attendedCount / attendanceWithLessons.length) * 100
            : 0;
        setAttendanceRate(attendancePercentage);

        // Группируем оценки по предметам/урокам
        setAttendanceData(attendanceWithLessons);
      } catch (err) {
        console.error("Ошибка при загрузке оценок:", err);
        setError("Не удалось загрузить данные об оценках");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-6">Загрузка данных об оценках...</div>
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
        У вас пока нет оценок.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Средний балл</h3>
          <div className="text-3xl font-bold text-indigo-600">
            {averageScore.toFixed(1)}
          </div>
          <p className="text-sm text-gray-500 mt-2">Из 100 возможных</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Посещаемость</h3>
          <div className="text-3xl font-bold text-indigo-600">
            {attendanceRate.toFixed(0)}%
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Вы посетили{" "}
            {attendanceData.filter((record) => record.present).length} из{" "}
            {attendanceData.length} уроков
          </p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Все оценки</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Урок
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Оценка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Присутствие
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData.map((record) => (
              <tr key={record.$id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {record.lesson?.title || "Неизвестный урок"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-semibold">
                    {record.score}
                  </div>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentGrades;
