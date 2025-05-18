// pages/teacher/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { UserRole } from "../../types";
import Layout from "../../components/common/Layout";
import { useUserTestResults } from "@/services/testService"; // Обновленный импорт
import Button from "../../components/common/Button";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { formatScore } from "@/utils/formatters";

const TeacherDashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Используем хук для получения результатов тестов пользователя
  const { data: results = [], isLoading: resultsLoading } = useUserTestResults(
    user?.$id || ""
  );

  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [stats, setStats] = useState({
    testsCompleted: 0,
    testsPassed: 0,
    averageScore: 0,
  });

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль преподавателя
    if (!loading && (!user || user.role !== UserRole.TEACHER)) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Нам больше не нужен useEffect для загрузки результатов,
  // т.к. React Query загружает данные автоматически

  // Обработка результатов
  useEffect(() => {
    if (results.length > 0) {
      // Подсчет статистики
      const completedTests = results.length;
      const passedTests = results.filter((result) => result.score >= 60).length;
      const totalScore = results.reduce((sum, result) => sum + result.score, 0);
      const avgScore =
        completedTests > 0
          ? Math.round((totalScore / completedTests) * 10) / 10
          : 0;

      setStats({
        testsCompleted: completedTests,
        testsPassed: passedTests,
        averageScore: avgScore,
      });

      // Получение последних результатов (до 3)
      const sortedResults = [...results].sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );

      setRecentResults(sortedResults.slice(0, 3));
    }
  }, [results]);

  if (loading || !user) {
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

  return (
    <Layout title="Личный кабинет преподавателя">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Добро пожаловать, {user.name}!
          </h1>
          <p className="text-gray-600">
            Здесь вы можете проходить тесты для оценки ваших профессиональных
            компетенций.
          </p>
        </div>

        {/* Блоки статистики */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-500 mr-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Тестов пройдено</p>
                <p className="text-2xl font-bold">
                  {resultsLoading ? (
                    <span className="text-gray-300">...</span>
                  ) : (
                    stats.testsCompleted
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Успешно сдано</p>
                <p className="text-2xl font-bold">
                  {resultsLoading ? (
                    <span className="text-gray-300">...</span>
                  ) : (
                    stats.testsPassed
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Средний балл</p>
                <p className="text-2xl font-bold">
                  {resultsLoading ? (
                    <span className="text-gray-300">...</span>
                  ) : (
                    `${stats.averageScore}%`
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Доступные действия */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-3">Доступные тесты</h3>
              <p className="text-gray-600 mb-4">
                Выберите и пройдите тесты для оценки ваших профессиональных
                компетенций
              </p>
              <Link href="/teacher/tests">
                <Button variant="primary">Перейти к тестам</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-3">
                Результаты тестирования
              </h3>
              <p className="text-gray-600 mb-4">
                Просмотрите свои результаты по всем пройденным тестам
              </p>
              <Link href="/teacher/results">
                <Button variant="primary">Посмотреть результаты</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Последние результаты */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Последние результаты</h2>

          {resultsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка результатов...</p>
            </div>
          ) : recentResults.length === 0 ? (
            <p className="text-gray-500 py-4">
              У вас пока нет пройденных тестов.
              <Link
                href="/teacher/tests"
                className="text-indigo-500 hover:underline ml-1"
              >
                Перейти к тестам
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div key={result.$id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{result.testName || "Тест"}</h3>
                      <p className="text-sm text-gray-500">
                        Пройден:{" "}
                        {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatScore(result.score)}%
                      </p>
                      <p
                        className={`text-sm ${
                          result.score >= 60 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {result.score >= 60 ? "Сдано" : "Не сдано"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center mt-4">
                <Link href="/teacher/results">
                  <Button variant="secondary" size="sm">
                    Посмотреть все результаты
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
