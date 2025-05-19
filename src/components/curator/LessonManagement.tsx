// components/curator/LessonManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { lessonApi } from "@/services/lessonService";
import { groupApi } from "@/services/groupService";
import { userApi } from "@/services/userService";
import { Lesson, Group, User, UserRole } from "@/types";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function LessonManagement() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Состояния для формы создания урока
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonDate, setLessonDate] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [processingLesson, setProcessingLesson] = useState(false);

  // Состояние для редактирования урока
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Загружаем уроки
        const lessonsData = await lessonApi.getAllLessons();
        setLessons(lessonsData);

        // Загружаем группы
        const groupsData = await groupApi.getAllGroups();
        setGroups(groupsData);

        // Загружаем активных преподавателей
        const teachersData = await userApi.getUsersByRole(UserRole.TEACHER);
        const activeTeachers = teachersData.filter(
          (teacher) => teacher.isActive
        );
        setTeachers(activeTeachers);
      } catch (err: any) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Обработчик создания урока
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonTitle.trim()) {
      setError("Название урока не может быть пустым");
      return;
    }

    if (!selectedGroup) {
      setError("Необходимо выбрать группу");
      return;
    }

    if (!selectedTeacher) {
      setError("Необходимо выбрать преподавателя");
      return;
    }

    if (!lessonDate) {
      setError("Необходимо указать дату урока");
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
        groupId: selectedGroup,
        teacherId: selectedTeacher,
      });

      // Обновляем список уроков
      setLessons([...lessons, newLesson]);

      // Сбрасываем форму
      resetForm();

      setSuccess("Урок успешно создан");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при создании урока:", err);
      setError(err.message || "Ошибка при создании урока");
    } finally {
      setProcessingLesson(false);
    }
  };

  // Обработчик обновления урока
  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingLesson) {
      return;
    }

    if (!lessonTitle.trim()) {
      setError("Название урока не может быть пустым");
      return;
    }

    try {
      setProcessingLesson(true);
      setError(null);

      // Обновляем урок
      const updatedLesson = await lessonApi.updateLesson(editingLesson.$id!, {
        title: lessonTitle,
        description: lessonDescription,
        date: lessonDate,
        groupId: selectedGroup,
        teacherId: selectedTeacher,
      });

      // Обновляем список уроков
      setLessons(
        lessons.map((lesson) =>
          lesson.$id === updatedLesson.$id ? updatedLesson : lesson
        )
      );

      // Сбрасываем форму
      resetForm();

      setSuccess("Урок успешно обновлен");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при обновлении урока:", err);
      setError(err.message || "Ошибка при обновлении урока");
    } finally {
      setProcessingLesson(false);
    }
  };

  // Функция для начала редактирования урока
  const startEditingLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description || "");
    setLessonDate(lesson.date);
    setSelectedGroup(lesson.groupId);
    setSelectedTeacher(lesson.teacherId);
    setShowCreateForm(true);

    // Прокручиваем страницу к форме
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Обработчик удаления урока
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот урок?")) {
      return;
    }

    try {
      await lessonApi.deleteLesson(lessonId);

      // Обновляем список уроков
      setLessons(lessons.filter((lesson) => lesson.$id !== lessonId));

      setSuccess("Урок успешно удален");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при удалении урока:", err);
      setError(err.message || "Ошибка при удалении урока");
    }
  };

  // Функция сброса формы
  const resetForm = () => {
    setShowCreateForm(false);
    setEditingLesson(null);
    setLessonTitle("");
    setLessonDescription("");
    setLessonDate("");
    setSelectedGroup("");
    setSelectedTeacher("");
  };

  // Вспомогательные функции для отображения данных
  const getGroupTitle = (groupId: string) => {
    const group = groups.find((g) => g.$id === groupId);
    return group ? group.title : "Неизвестная группа";
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.$id === teacherId);
    return teacher ? teacher.name : "Неизвестный преподаватель";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMMM yyyy", { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  // Отображение формы создания/редактирования урока
  const renderLessonForm = () => (
    <form
      onSubmit={editingLesson ? handleUpdateLesson : handleCreateLesson}
      className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200"
    >
      <h3 className="text-lg font-bold mb-4">
        {editingLesson ? "Редактирование урока" : "Создание нового урока"}
      </h3>

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

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="groupId"
        >
          Группа
        </label>
        <select
          id="groupId"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Выберите группу</option>
          {groups.map((group) => (
            <option key={group.$id} value={group.$id}>
              {group.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="teacherId"
        >
          Преподаватель
        </label>
        <select
          id="teacherId"
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Выберите преподавателя</option>
          {teachers.map((teacher) => (
            <option key={teacher.$id} value={teacher.$id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={processingLesson}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {processingLesson
            ? editingLesson
              ? "Сохранение..."
              : "Создание..."
            : editingLesson
            ? "Сохранить изменения"
            : "Создать урок"}
        </button>

        <button
          type="button"
          onClick={resetForm}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Отмена
        </button>
      </div>
    </form>
  );

  // Отображение списка уроков
  const renderLessonsList = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Группа
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Преподаватель
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson.$id}>
              <td className="py-2 px-4 border-b border-gray-200">
                {lesson.title}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                {getGroupTitle(lesson.groupId)}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                {getTeacherName(lesson.teacherId)}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                {formatDate(lesson.date)}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                <button
                  onClick={() => startEditingLesson(lesson)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDeleteLesson(lesson.$id!)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Управление уроками</h2>

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Создать урок
          </button>
        )}
      </div>

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

      {showCreateForm && renderLessonForm()}

      {loading ? (
        <p className="text-gray-500">Загрузка данных...</p>
      ) : lessons.length === 0 ? (
        <p className="text-gray-500">Нет созданных уроков</p>
      ) : (
        renderLessonsList()
      )}
    </div>
  );
}

export default LessonManagement;
