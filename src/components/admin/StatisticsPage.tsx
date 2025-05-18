// components/admin/StatisticsPage.tsx (обновленная версия)
import React, { useState, useEffect } from "react";
import { useAllTestResults, useTests } from "@/services/testService";
import { useCategories } from "@/services/categoryService";
import { useTeachers } from "@/services/authService";
import { Test, User, Category, TestResult } from "@/types";

// Тип для агрегированной статистики
interface AggregatedStats {
  totalTeachers: number;
  totalCategories: number;
  totalTests: number;
  totalTestAttempts: number;
  averageScore: number;
}

// Тип для статистики по тестам
interface TestStats {
  testId: string;
  testName: string;
  categoryName: string;
  totalAttempts: number;
  averageScore: number;
  passCount: number; // Количество сдавших (score >= 60)
}

// Тип для статистики по пользователям
interface UserStats {
  userId: string;
  userName: string;
  email: string;
  testsCompleted: number;
  averageScore: number;
}

const StatisticsPage: React.FC = () => {
  const { data: results = [], isLoading: resultsLoading } = useAllTestResults();
  const { data: tests = [], isLoading: testsLoading } = useTests();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats>({
    totalTeachers: 0,
    totalCategories: 0,
    totalTests: 0,
    totalTestAttempts: 0,
    averageScore: 0,
  });

  const [testStats, setTestStats] = useState<TestStats[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);

  const isLoading =
    resultsLoading || testsLoading || teachersLoading || categoriesLoading;

  // Расчет статистики
  useEffect(() => {
    if (isLoading) return;

    calculateStatistics(teachers, categories, tests, results);
  }, [teachers, categories, tests, results, isLoading]);

  // Расчет статистики
  const calculateStatistics = (
    teachers: User[],
    categories: Category[],
    tests: Test[],
    results: TestResult[]
  ) => {
    // Агрегированная статистика
    const totalScores = results.reduce((sum, result) => sum + result.score, 0);
    const avgScore = results.length > 0 ? totalScores / results.length : 0;

    setAggregatedStats({
      totalTeachers: teachers.length,
      totalCategories: categories.length,
      totalTests: tests.length,
      totalTestAttempts: results.length,
      averageScore: Math.round(avgScore * 10) / 10, // Округляем до 1 знака после запятой
    });

    // Статистика по тестам
    const testStatsMap = new Map<string, TestStats>();

    tests.forEach((test) => {
      const category = categories.find((c) => c.$id === test.categoryId);

      testStatsMap.set(test.$id!, {
        testId: test.$id!,
        testName: test.name,
        categoryName: category?.name || "Неизвестная категория",
        totalAttempts: 0,
        averageScore: 0,
        passCount: 0,
      });
    });

    // Заполняем статистику результатами тестов
    results.forEach((result) => {
      const testStat = testStatsMap.get(result.testId);

      if (testStat) {
        testStat.totalAttempts += 1;
        const newTotalScore =
          testStat.averageScore * (testStat.totalAttempts - 1) + result.score;
        testStat.averageScore = newTotalScore / testStat.totalAttempts;

        if (result.score >= 60) {
          testStat.passCount += 1;
        }
      }
    });

    setTestStats(Array.from(testStatsMap.values()));

    // Статистика по пользователям
    const userStatsMap = new Map<string, UserStats>();

    teachers.forEach((teacher) => {
      userStatsMap.set(teacher.$id!, {
        userId: teacher.$id!,
        userName: teacher.name,
        email: teacher.email,
        testsCompleted: 0,
        averageScore: 0,
      });
    });

    // Заполняем статистику по пользователям
    results.forEach((result) => {
      const userStat = userStatsMap.get(result.userId);

      if (userStat) {
        userStat.testsCompleted += 1;
        const newTotalScore =
          userStat.averageScore * (userStat.testsCompleted - 1) + result.score;
        userStat.averageScore = newTotalScore / userStat.testsCompleted;
      }
    });

    setUserStats(
      Array.from(userStatsMap.values())
        .filter((stat) => stat.testsCompleted > 0) // Показываем только преподавателей, прошедших хотя бы один тест
        .sort((a, b) => b.averageScore - a.averageScore)
    ); // Сортируем по убыванию среднего балла
  };

  if (isLoading) {
    return <div className="p-4">Загрузка статистики...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Статистика системы</h2>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded shadow">
          <h3 className="font-semibold text-blue-900">Преподаватели</h3>
          <p className="text-2xl font-bold">{aggregatedStats.totalTeachers}</p>
        </div>

        <div className="bg-green-50 p-4 rounded shadow">
          <h3 className="font-semibold text-green-900">Категории</h3>
          <p className="text-2xl font-bold">
            {aggregatedStats.totalCategories}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded shadow">
          <h3 className="font-semibold text-purple-900">Тесты</h3>
          <p className="text-2xl font-bold">{aggregatedStats.totalTests}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded shadow">
          <h3 className="font-semibold text-yellow-900">Попытки</h3>
          <p className="text-2xl font-bold">
            {aggregatedStats.totalTestAttempts}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded shadow">
          <h3 className="font-semibold text-red-900">Средний балл</h3>
          <p className="text-2xl font-bold">{aggregatedStats.averageScore}%</p>
        </div>
      </div>

      {/* Статистика по тестам */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Статистика по тестам</h3>

        {testStats.length === 0 ? (
          <p className="text-gray-500">Нет данных о прохождении тестов</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тест
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Попыток
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Средний балл
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сдали
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % сдачи
                  </th>
                </tr>
              </thead>
              <tbody>
                {testStats.map((stat) => (
                  <tr key={stat.testId}>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {stat.testName}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {stat.categoryName}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {stat.totalAttempts}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {stat.totalAttempts > 0
                        ? `${Math.round(stat.averageScore * 10) / 10}%`
                        : "-"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {stat.passCount}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {stat.totalAttempts > 0
                        ? `${Math.round(
                            (stat.passCount / stat.totalAttempts) * 100
                          )}%`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Статистика по пользователям */}
      <div>
        <h3 className="text-xl font-bold mb-4">Статистика по преподавателям</h3>

        {userStats.length === 0 ? (
          <p className="text-gray-500">
            Нет данных о прохождении тестов преподавателями
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Преподаватель
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тестов пройдено
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Средний балл
                  </th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((stat) => (
                  <tr key={stat.userId}>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {stat.userName}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {stat.email}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {stat.testsCompleted}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {Math.round(stat.averageScore * 10) / 10}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
