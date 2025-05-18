// pages/teacher/test/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { UserRole } from "../../../types";
import Layout from "../../../components/common/Layout";
import TestAttempt from "../../../components/teacher/TestAttempt";
import { useTest } from "@/services/testService"; // Обновленный импорт
import { useAuth } from "@/context/AuthProvider";

const TestPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();

  // Используем хук для получения одного теста вместо всех тестов
  const { data: test, isLoading: testLoading } = useTest((id as string) || "");

  // Нам больше не нужно хранить название теста в отдельном состоянии,
  // так как мы можем получить его напрямую из test.name

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль преподавателя
    if (!loading && (!user || user.role !== UserRole.TEACHER)) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Нам больше не нужен useEffect для загрузки данных,
  // React Query автоматически загружает данные

  if (loading || !user || testLoading) {
    return (
      <Layout title="Загрузка...">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Если пользователь не преподаватель, не отображаем ничего (будет перенаправление)
  if (user.role !== UserRole.TEACHER) {
    return null;
  }

  if (!id) {
    return (
      <Layout title="Ошибка">
        <div className="container mx-auto px-4 py-8">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Ошибка! </strong>
            <span className="block sm:inline">
              Идентификатор теста не указан.
            </span>
          </div>
        </div>
      </Layout>
    );
  }

  // Если тест не найден
  if (!test) {
    return (
      <Layout title="Тест не найден">
        <div className="container mx-auto px-4 py-8">
          <div
            className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Внимание! </strong>
            <span className="block sm:inline">
              Тест с указанным идентификатором не найден.
            </span>
          </div>
          <button
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => router.push("/teacher/tests")}
          >
            Вернуться к списку тестов
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={test.name ? `Тест: ${test.name}` : "Прохождение теста"}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {test.name || "Прохождение теста"}
        </h1>

        <TestAttempt testId={id as string} />
      </div>
    </Layout>
  );
};

export default TestPage;
