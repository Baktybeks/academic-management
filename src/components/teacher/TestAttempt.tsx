// components/teacher/TestAttempt.tsx (обновленная версия)
import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  useTestQuestions,
  useEvaluateTestAnswers,
  useSubmitTestResult,
} from "@/services/testService";
import { SubmitAnswerPayload, TestAttemptResult } from "@/types";
import { useAuth } from "@/context/AuthProvider";
import { formatScore } from "@/utils/formatters";

const TestAttempt: React.FC<{ testId: string }> = ({ testId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { data: questions = [], isLoading: questionsLoading } =
    useTestQuestions(testId);

  const evaluateTestMutation = useEvaluateTestAnswers();
  const submitResultMutation = useSubmitTestResult();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, number>
  >({});
  const [testResult, setTestResult] = useState<TestAttemptResult | null>(null);

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    // Проверяем, что на все вопросы есть ответы
    const unansweredQuestions = questions.filter(
      (q) => selectedOptions[q.$id!] === undefined
    );

    if (unansweredQuestions.length > 0) {
      alert(
        `Вы не ответили на ${unansweredQuestions.length} вопросов. Пожалуйста, ответьте на все вопросы перед отправкой.`
      );
      return;
    }

    if (!user || !user.$id) {
      alert("Необходимо авторизоваться для отправки результатов");
      return;
    }

    try {
      // Подготавливаем ответы в нужном формате
      const answers: SubmitAnswerPayload[] = questions.map((question) => ({
        questionId: question.$id!,
        selectedOptionIndex: selectedOptions[question.$id!],
      }));

      // Проверяем ответы и получаем результат
      const result = await evaluateTestMutation.mutateAsync({
        testId,
        answers,
      });

      // Сохраняем результат в базе данных
      await submitResultMutation.mutateAsync({
        userId: user.$id,
        testId,
        score: result.score,
      });

      setTestResult(result);
    } catch (error: any) {
      alert(`Ошибка при отправке теста: ${error.message}`);
    }
  };

  if (questionsLoading) {
    return <div className="p-4">Загрузка теста...</div>;
  }

  if (evaluateTestMutation.error || submitResultMutation.error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        <span className="block sm:inline">
          {((evaluateTestMutation.error || submitResultMutation.error) as Error)
            .message || "Произошла ошибка при обработке теста"}
        </span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div
        className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        <span className="block sm:inline">
          Этот тест не содержит вопросов. Пожалуйста, вернитесь к списку тестов.
        </span>
      </div>
    );
  }

  // Отображаем результат теста
  if (testResult) {
    return (
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6">Результаты теста</h2>

        <div className="mb-6">
          <div
            className={`p-6 rounded-lg ${
              testResult.score >= 60 ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <h3 className="text-xl font-bold mb-2">
              {testResult.score >= 60
                ? "Тест успешно пройден!"
                : "Тест не пройден"}
            </h3>
            <p className="text-lg mb-2">
              Правильных ответов: {testResult.correctAnswers} из{" "}
              {testResult.totalQuestions}
            </p>
            <p className="text-lg font-bold">
              <p>Ваш результат: {formatScore(testResult.score)}%</p>
            </p>
            <p className="text-sm mt-2 text-gray-600">
              Для успешного прохождения теста необходимо набрать не менее 60%
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.push("/teacher/tests")}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Вернуться к списку тестов
          </button>

          <button
            onClick={() => router.push("/teacher/results")}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Посмотреть все результаты
          </button>
        </div>
      </div>
    );
  }

  // Отображаем текущий вопрос
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Прохождение теста</h2>
          <p className="text-gray-600">
            Вопрос {currentQuestionIndex + 1} из {questions.length}
          </p>
        </div>

        {/* Прогресс бар */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
          ></div>
        </div>

        {/* Текст вопроса */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">{currentQuestion.text}</h3>
        </div>

        {/* Варианты ответов */}
        <div className="mb-8">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="mb-2">
              <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={`question-${currentQuestion.$id}`}
                  checked={selectedOptions[currentQuestion.$id!] === index}
                  onChange={() =>
                    handleOptionSelect(currentQuestion.$id!, index)
                  }
                  className="mr-2"
                />
                <span>{option}</span>
              </label>
            </div>
          ))}
        </div>

        {/* Навигация по вопросам */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`py-2 px-4 rounded font-bold ${
              currentQuestionIndex === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-500 hover:bg-gray-700 text-white"
            }`}
          >
            Предыдущий
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              Следующий
            </button>
          ) : (
            <button
              onClick={handleSubmitTest}
              disabled={
                evaluateTestMutation.isPending || submitResultMutation.isPending
              }
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                evaluateTestMutation.isPending || submitResultMutation.isPending
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {evaluateTestMutation.isPending || submitResultMutation.isPending
                ? "Отправка..."
                : "Завершить тест"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestAttempt;
