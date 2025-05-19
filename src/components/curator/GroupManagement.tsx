// components/curator/GroupManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import { groupApi } from "@/services/groupService";
import { userApi } from "@/services/userService";
import { Group, User, UserRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export function GroupManagement() {
  // Получаем данные текущего пользователя (куратора)
  const { user } = useAuth();

  // Состояния для списка групп
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Состояния для формы создания группы
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupTitle, setGroupTitle] = useState(""); // Изменено с groupName на groupTitle
  const [selectedTeacher, setSelectedTeacher] = useState<string>(""); // Добавлено для выбора преподавателя
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Состояния для редактирования группы
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Загружаем список групп, студентов и преподавателей
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Загружаем группы
        const groupsData = await groupApi.getAllGroups();
        setGroups(groupsData);

        // Загружаем студентов
        const studentsData = await userApi.getUsersByRole(UserRole.STUDENT);
        setStudents(studentsData);

        // Загружаем преподавателей
        const teachersData = await userApi.getUsersByRole(UserRole.TEACHER);
        setTeachers(teachersData);
      } catch (err: any) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Обработчик создания группы
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupTitle.trim()) {
      setError("Название группы не может быть пустым");
      return;
    }

    if (!selectedTeacher) {
      setError("Необходимо выбрать преподавателя группы");
      return;
    }

    try {
      setCreatingGroup(true);
      setError(null);

      // Создаем новую группу
      const newGroup = await groupApi.createGroup({
        title: groupTitle, // Изменено с name на title
        studentIds: selectedStudents,
        teacherId: selectedTeacher, // Добавлено поле teacherId
        createdBy: user?.$id || "", // ID текущего пользователя (куратора)
      });

      // Обновляем список групп
      setGroups([...groups, newGroup]);

      // Сбрасываем форму
      setGroupTitle("");
      setSelectedTeacher("");
      setSelectedStudents([]);
      setShowCreateForm(false);

      setSuccess("Группа успешно создана");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при создании группы:", err);
      setError(err.message || "Ошибка при создании группы");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Обработчик обновления группы
  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingGroup || !groupTitle.trim()) {
      setError("Название группы не может быть пустым");
      return;
    }

    if (!selectedTeacher) {
      setError("Необходимо выбрать преподавателя группы");
      return;
    }

    try {
      setCreatingGroup(true);
      setError(null);

      // Обновляем группу
      const updatedGroup = await groupApi.updateGroup(editingGroup.$id!, {
        title: groupTitle, // Изменено с name на title
        studentIds: selectedStudents,
        teacherId: selectedTeacher, // Добавлено поле teacherId
      });

      // Обновляем список групп
      setGroups(
        groups.map((group) =>
          group.$id === updatedGroup.$id ? updatedGroup : group
        )
      );

      // Сбрасываем форму редактирования
      setEditingGroup(null);
      setGroupTitle("");
      setSelectedTeacher("");
      setSelectedStudents([]);

      setSuccess("Группа успешно обновлена");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при обновлении группы:", err);
      setError(err.message || "Ошибка при обновлении группы");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Функция для начала редактирования группы
  const startEditingGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupTitle(group.title); // Изменено с name на title
    setSelectedTeacher(group.teacherId); // Добавлено
    setSelectedStudents(group.studentIds || []);
    setShowCreateForm(true);
  };

  // Обработчик удаления группы
  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту группу?")) {
      return;
    }

    try {
      await groupApi.deleteGroup(groupId);

      // Обновляем список групп
      setGroups(groups.filter((group) => group.$id !== groupId));

      setSuccess("Группа успешно удалена");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при удалении группы:", err);
      setError(err.message || "Ошибка при удалении группы");
    }
  };

  // Переключение выбора студента
  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  // Функция для получения имени преподавателя по ID
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.$id === teacherId);
    return teacher ? teacher.name : "Не назначен";
  };

  // Отображение формы создания/редактирования группы
  const renderGroupForm = () => (
    <form
      onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}
      className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200"
    >
      <h3 className="text-lg font-bold mb-4">
        {editingGroup ? "Редактирование группы" : "Создание новой группы"}
      </h3>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="groupTitle"
        >
          Название группы
        </label>
        <input
          id="groupTitle"
          type="text"
          placeholder="Например: ИТ-101"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="teacherId"
        >
          Преподаватель группы
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
              {teacher.name} ({teacher.email})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Выберите студентов для группы
        </label>
        <div className="max-h-60 overflow-y-auto border rounded p-2">
          {students.length === 0 ? (
            <p className="text-gray-500 text-sm">Нет доступных студентов</p>
          ) : (
            students.map((student) => (
              <div key={student.$id} className="py-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.$id!)}
                    onChange={() => toggleStudentSelection(student.$id!)}
                    className="mr-2"
                  />
                  <span>
                    {student.name} ({student.email})
                  </span>
                </label>
              </div>
            ))
          )}
        </div>
        <p className="text-gray-500 text-xs mt-1">
          Выбрано студентов: {selectedStudents.length}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={creatingGroup}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {creatingGroup
            ? editingGroup
              ? "Сохранение..."
              : "Создание..."
            : editingGroup
            ? "Сохранить изменения"
            : "Создать группу"}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowCreateForm(false);
            setEditingGroup(null);
            setGroupTitle("");
            setSelectedTeacher("");
            setSelectedStudents([]);
          }}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Отмена
        </button>
      </div>
    </form>
  );

  // Отображение списка групп
  const renderGroupsList = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Преподаватель
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Кол-во студентов
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.$id}>
              <td className="py-2 px-4 border-b border-gray-200">
                {group.title} {/* Изменено с name на title */}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                {getTeacherName(group.teacherId)}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                {group.studentIds?.length || 0}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                <button
                  onClick={() => startEditingGroup(group)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.$id!)}
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
        <h2 className="text-xl font-bold">Управление группами</h2>

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Создать группу
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

      {showCreateForm && renderGroupForm()}

      {loading ? (
        <p className="text-gray-500">Загрузка данных...</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-500">Нет созданных групп</p>
      ) : (
        renderGroupsList()
      )}
    </div>
  );
}

export default GroupManagement;
