// components/teacher/TestResults.tsx (обновленная версия)
import React, { useEffect, useState } from "react";
import { useUserTestResults, useTests } from "@/services/testService";
import { useCategories } from "@/services/categoryService";
import { useAuth } from "@/context/AuthProvider";
import { formatScore } from "@/utils/formatters";

interface EnrichedTestResult {
  $id?: string;
  testId: string;
  testName: string;
  categoryName: string;
  score: number;
  completedAt: string;
}

const TestResults: React.FC = () => {
  const { user } = useAuth();
  const { data: tests = [] } = useTests();
  const { data: categories = [] } = useCategories();
  const { data: userResults = [], isLoading } = useUserTestResults(
    user?.$id || ""
  );

  const [enrichedResults, setEnrichedResults] = useState<EnrichedTestResult[]>(
    []
  );

  // Обогащаем результаты тестов дополнительной информацией
  useEffect(() => {
    if (userResults.length && tests.length && categories.length) {
      const enriched = userResults.map((result) => {
        const test = tests.find((t) => t.$id === result.testId) || {
          name: "Неизвестный тест",
          categoryId: "",
        };
        const category = categories.find((c) => c.$id === test.categoryId) || {
          name: "Неизвестная категория",
        };

        return {
          ...result,
          testName: test.name,
          categoryName: category.name,
        };
      });

      // Сортируем результаты по дате прохождения (от новых к старым)
      enriched.sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );

      setEnrichedResults(enriched);
    }
  }, [userResults, tests, categories]);

  // Расчет статистики
  const calculateAverageScore = () => {
    if (enrichedResults.length === 0) return 0;

    const totalScore = enrichedResults.reduce(
      (sum, result) => sum + result.score,
      0
    );
    return Math.round((totalScore / enrichedResults.length) * 10) / 10; // Округляем до 1 знака после запятой
  };

  const calculatePassedTests = () => {
    return enrichedResults.filter((result) => result.score >= 60).length;
  };

  if (isLoading) {
    return <div className="p-4">Загрузка результатов...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Мои результаты тестов</h2>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded shadow">
          <h3 className="font-semibold text-blue-900">Тестов пройдено</h3>
          <p className="text-2xl font-bold">{enrichedResults.length}</p>
        </div>

        <div className="bg-green-50 p-4 rounded shadow">
          <h3 className="font-semibold text-green-900">Успешно сдано</h3>
          <p className="text-2xl font-bold">{calculatePassedTests()}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded shadow">
          <h3 className="font-semibold text-purple-900">Средний балл</h3>
          <p className="text-2xl font-bold">{calculateAverageScore()}%</p>
        </div>
      </div>

      {/* Таблица результатов */}
      {enrichedResults.length === 0 ? (
        <p className="text-gray-500">У вас пока нет результатов тестов</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тест
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Результат
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {enrichedResults.map((result) => (
                <tr key={result.$id}>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {new Date(result.completedAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {result.testName}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {result.categoryName}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {formatScore(result.score)}%
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.score >= 60
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.score >= 60 ? "Сдано" : "Не сдано"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestResults;
