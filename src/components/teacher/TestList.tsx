// components/teacher/TestList.tsx
import React, { useEffect, useState } from "react";
import { useTests } from "@/services/testService"; // Обновленный импорт
import { useCategories } from "@/services/categoryService";
import { Test } from "../../types";
import Link from "next/link";

const TestList: React.FC = () => {
  // Используем новый хук useTests из testService
  const {
    data: tests = [], // Изменено с tests на data: tests
    isLoading: testsLoading, // Изменено с loading на isLoading
    isError: isTestsError, // Изменено с error на isError
    error: testsError,
    // Здесь fetchTests больше не нужен, так как React Query загружает данные автоматически
  } = useTests();

  // Используем хук useCategories из categoryService (уже обновлен)
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);

  // Удаляем вызов fetchTests - React Query автоматически загружает данные
  // useEffect(() => {
  //   fetchTests();
  // }, []);

  // Фильтрация тестов при изменении выбранной категории или списка тестов
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredTests(tests);
    } else {
      setFilteredTests(
        tests.filter((test) => test.categoryId === selectedCategory)
      );
    }
  }, [selectedCategory, tests]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.$id === categoryId);
    return category ? category.name : "Неизвестная категория";
  };

  if (testsLoading || categoriesLoading) {
    return <div className="p-4">Загрузка тестов...</div>;
  }

  if (isTestsError || isCategoriesError) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        <span className="block sm:inline">
          {testsError?.message ||
            categoriesError?.message ||
            "Произошла ошибка при загрузке данных"}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Доступные тесты</h2>

      {/* Фильтр по категориям */}
      <div className="mb-6">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="category-filter"
        >
          Фильтр по категориям
        </label>
        <select
          id="category-filter"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Все категории</option>
          {categories.map((category) => (
            <option key={category.$id} value={category.$id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Список тестов */}
      {filteredTests.length === 0 ? (
        <p className="text-gray-500">Нет доступных тестов</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.$id}
              className="border rounded-lg overflow-hidden shadow-lg"
            >
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{test.name}</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Категория: {getCategoryName(test.categoryId)}
                </p>
                <p className="text-gray-700 mb-4">
                  {test.description || "Нет описания"}
                </p>
                <Link
                  href={`/teacher/test/${test.$id}`}
                  className="inline-block bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Пройти тест
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestList;
