// Исправленный компонент SurveyCompletion
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { surveyApi } from "@/services/surveyService";
import { groupApi } from "@/services/groupService";
import { surveyResponseApi } from "@/services/surveyResponseService";
import { Survey, SurveyQuestion, Group } from "@/types";

interface SurveyCompletionProps {
  surveyId: string;
}

export function SurveyCompletion({ surveyId }: SurveyCompletionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveyData = async () => {
      // Проверяем, что user и surveyId существуют
      if (!user || !user.$id || !surveyId) {
        setError("Ошибка: недостаточно данных");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Получаем информацию об опроснике
        const surveyData = await surveyApi.getSurveyById(surveyId);
        if (!surveyData) {
          setError("Опросник не найден");
          return;
        }

        setSurvey(surveyData);

        // Получаем вопросы для опросника
        const questionsData = await surveyApi.getQuestionsBySurveyId(surveyId);
        setQuestions(questionsData);

        // Инициализируем ответы нулевыми значениями
        const initialAnswers: Record<string, number> = {};
        questionsData.forEach((q) => {
          // Проверяем, что q.$id существует
          if (q.$id) {
            initialAnswers[q.$id] = 0;
          }
        });
        setAnswers(initialAnswers);

        // Получаем группы, в которых состоит студент
        const studentGroups = await groupApi.getGroupsByStudentId(user.$id);
        setGroups(studentGroups);

        if (studentGroups.length > 0 && studentGroups[0].$id) {
          setSelectedGroup(studentGroups[0].$id);
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных опросника:", err);
        setError(
          "Не удалось загрузить опросник. Пожалуйста, попробуйте позже."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [user, surveyId]);

  // Обработчик изменения ответа
  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Обработчик отправки опросника
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем, что все необходимые данные существуют
    if (!user || !user.$id || !survey || !survey.$id || !selectedGroup) {
      setError("Недостаточно данных для отправки опросника");
      return;
    }

    const selectedGroupData = groups.find((g) => g.$id === selectedGroup);
    if (!selectedGroupData || !selectedGroupData.teacherId) {
      setError("Выбранная группа не найдена или не имеет преподавателя");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Создаем запись об ответе на опросник
      const response = await surveyResponseApi.createResponse({
        surveyId: survey.$id,
        studentId: user.$id,
        teacherId: selectedGroupData.teacherId,
      });

      // Проверяем наличие ID ответа
      if (!response || !response.$id) {
        throw new Error("Не удалось создать запись ответа");
      }

      // Создаем ответы на все вопросы
      const answersList = Object.entries(answers)
        .filter(([questionId]) => questionId) // Исключаем пустые ID
        .map(([questionId, value]) => ({
          responseId: response.$id!,
          questionId,
          value,
        }));

      await surveyResponseApi.bulkCreateAnswers(answersList);

      setSuccess("Спасибо! Ваши ответы успешно отправлены.");

      // Перенаправляем на страницу со списком опросников через 2 секунды
      setTimeout(() => {
        router.push("/student/surveys");
      }, 2000);
    } catch (err) {
      console.error("Ошибка при отправке ответов:", err);
      setError("Не удалось отправить ответы. Пожалуйста, попробуйте еще раз.");
    } finally {
      setSubmitting(false);
    }
  };

  // Остальная часть компонента без изменений...

  if (loading) {
    return <div className="text-center py-6">Загрузка опросника...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
        {success}
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        Опросник не найден или недоступен.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Остаток компонента без изменений... */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">{survey.title}</h2>
          <p className="text-gray-600 mb-6">{survey.description}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="groupSelect"
              >
                Выберите группу и преподавателя для оценки
              </label>
              <select
                id="groupSelect"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Выберите группу</option>
                {groups.map(
                  (group) =>
                    group.$id && (
                      <option key={group.$id} value={group.$id}>
                        {group.title}
                      </option>
                    )
                )}
              </select>
            </div>

            <div className="space-y-4">
              {questions.map(
                (question, index) =>
                  question.$id && (
                    <div key={question.$id} className="bg-gray-50 p-4 rounded">
                      <h3 className="font-semibold mb-3">
                        {index + 1}. {question.text}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>0 - Полностью не согласен</span>
                          <span>100 - Полностью согласен</span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={answers[question.$id] || 0}
                          onChange={(e) =>
                            handleAnswerChange(
                              question.$id ?? "",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />

                        <div className="text-center font-bold text-indigo-600">
                          {answers[question.$id] || 0}
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {submitting ? "Отправка..." : "Отправить ответы"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SurveyCompletion;
