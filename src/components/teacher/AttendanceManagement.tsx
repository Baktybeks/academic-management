// components/teacher/AttendanceManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { lessonApi } from "@/services/lessonService";
import { groupApi } from "@/services/groupService";
import { userApi } from "@/services/userService";
import { attendanceApi } from "@/services/attendanceService";
import { Lesson, User, Attendance } from "@/types";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

interface AttendanceManagementProps {
  lessonId: string;
}

export function AttendanceManagement({ lessonId }: AttendanceManagementProps) {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [group, setGroup] = useState<{ $id: string; title: string } | null>(
    null
  );
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, Attendance>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !lessonId) return;

      try {
        setLoading(true);

        // Загружаем информацию об уроке
        const lessonData = await lessonApi.getLessonById(lessonId);
        if (!lessonData) {
          setError("Урок не найден");
          return;
        }

        // Проверяем, является ли преподаватель назначенным для этого урока
        if (lessonData.teacherId !== user.$id) {
          setError("У вас нет доступа к этому уроку");
          return;
        }

        setLesson(lessonData);

        // Загружаем информацию о группе
        const groupData = await groupApi.getGroupById(lessonData.groupId);
        if (!groupData) {
          setError("Группа не найдена");
          return;
        }

        setGroup({ $id: groupData.$id!, title: groupData.title });

        // Загружаем студентов группы
        let groupStudents: User[] = [];
        if (groupData.studentIds && groupData.studentIds.length > 0) {
          const studentsPromises = groupData.studentIds.map((id) =>
            userApi.getUserById(id)
          );

          const studentsResults = await Promise.all(studentsPromises);
          groupStudents = studentsResults.filter(Boolean) as User[];
        }

        setStudents(groupStudents);

        // Загружаем записи о посещаемости
        const attendanceData = await attendanceApi.getByLessonId(lessonId);

        // Преобразуем массив в объект для удобства доступа по studentId
        const attendanceMap: Record<string, Attendance> = {};
        attendanceData.forEach((record) => {
          attendanceMap[record.studentId] = record;
        });

        setAttendanceRecords(attendanceMap);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, lessonId]);

  // Обработчик изменения посещаемости
  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendanceRecords((prev) => {
      const updated = { ...prev };

      if (updated[studentId]) {
        updated[studentId] = { ...updated[studentId], present };
      } else {
        updated[studentId] = {
          lessonId,
          studentId,
          present,
          score: 0,
          createdAt: new Date().toISOString(),
          $id: "",
        };
      }

      return updated;
    });
  };

  // Обработчик изменения оценки
  const handleScoreChange = (studentId: string, score: number) => {
    setAttendanceRecords((prev) => {
      const updated = { ...prev };

      if (updated[studentId]) {
        updated[studentId] = { ...updated[studentId], score };
      } else {
        updated[studentId] = {
          lessonId,
          studentId,
          present: false,
          score,
          createdAt: new Date().toISOString(),
          $id: "",
        };
      }

      return updated;
    });
  };

  // Обработчик сохранения данных
  const handleSave = async () => {
    if (!lesson || !group) return;

    try {
      setSaving(true);
      setError(null);

      // Подготавливаем данные для сохранения
      const records = Object.values(attendanceRecords).map((record) => ({
        lessonId: record.lessonId,
        studentId: record.studentId,
        present: record.present,
        score: record.score,
      }));

      // Сохраняем все записи
      await attendanceApi.bulkUpsert(records);

      setSuccess("Посещаемость и оценки успешно сохранены");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Ошибка при сохранении данных:", err);
      setError("Не удалось сохранить данные. Пожалуйста, попробуйте позже.");
    } finally {
      setSaving(false);
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
      <div>
        <h2 className="text-xl font-bold">Посещаемость и оценки</h2>
        <p className="text-gray-600">
          Урок: <strong>{lesson?.title}</strong> | Дата:{" "}
          <strong>
            {lesson?.date ? formatDate(lesson.date) : "Не указана"}
          </strong>{" "}
          | Группа: <strong>{group?.title}</strong>
        </p>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      {students.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          В этой группе нет студентов.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Студент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Присутствие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Оценка (0-100)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.$id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name}
                    </div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          attendanceRecords[student.$id!]?.present || false
                        }
                        onChange={(e) =>
                          handleAttendanceChange(student.$id!, e.target.checked)
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900">
                        {attendanceRecords[student.$id!]?.present
                          ? "Присутствовал"
                          : "Отсутствовал"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={attendanceRecords[student.$id!]?.score || 0}
                      onChange={(e) =>
                        handleScoreChange(
                          student.$id!,
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      className="shadow appearance-none border rounded w-24 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-gray-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceManagement;
