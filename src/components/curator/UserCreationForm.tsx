// components/curator/UserCreationForm.tsx
"use client";

import React, { useState } from "react";
import { userApi } from "@/services/userService";
import { UserRole } from "@/types";

// Добавляем prop для колбэка после успешного создания
interface UserCreationFormProps {
  onUserCreated?: () => void;
}

export function UserCreationForm({ onUserCreated }: UserCreationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.TEACHER);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 8) {
      setError("Пароль должен содержать не менее 8 символов");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await userApi.createUser(name, email, password, role);

      // Очищаем форму после успешного создания
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setSuccess(
        `${
          role === UserRole.TEACHER ? "Преподаватель" : "Студент"
        } успешно создан. Пользователь получит доступ после активации.`
      );

      // Вызываем колбэк, если он предоставлен
      if (onUserCreated) {
        onUserCreated();
      }

      // Убираем сообщение через 5 секунд
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err: any) {
      console.error("Ошибка при создании пользователя:", err);
      setError(err.message || "Ошибка при создании пользователя");
    } finally {
      setLoading(false);
    }
  };

  // Остальная часть компонента (JSX) остается без изменений
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {/* Оставшаяся часть компонента без изменений */}
      <h2 className="text-xl font-bold mb-4">
        Создание {role === UserRole.TEACHER ? "преподавателя" : "студента"}
      </h2>

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

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="role"
          >
            Тип пользователя
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={UserRole.TEACHER}>Преподаватель</option>
            <option value={UserRole.STUDENT}>Студент</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            ФИО
          </label>
          <input
            id="name"
            type="text"
            placeholder="Иванов Иван Иванович"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@edu.ru"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Пароль
          </label>
          <input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <p className="text-gray-500 text-xs mt-1">Минимум 8 символов</p>
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="confirmPassword"
          >
            Подтверждение пароля
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? "Создание..." : "Создать пользователя"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserCreationForm;
