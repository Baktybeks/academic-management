"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Survey, SurveyQuestion } from "@/types";
import { surveyApi } from "@/services/surveyService";

export default function StudentSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.surveyId as string;

  const { user } = useAuthStore();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await surveyApi.getSurveyById(surveyId);

        if (data) {
          setSurvey(data);

          // Инициализируем ответы нулевыми значениями
          const initialAnswers: Record<string, number> = {};
          data.questions.forEach((q) => {
            initialAnswers[q.id] = 0;
          });
          setAnswers(initialAnswers);
        } else {
          setError("Опросник не найден или был удален.");
        }
      } catch (error) {
        setError(
          "Не удалось загрузить опросник. Пожалуйста, попробуйте позже."
        );
      }
    };

    if (surveyId) {
      fetchSurvey();
    }
  }, [surveyId]);

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !survey) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      await surveyApi.submitSurveyResponse({
        surveyId,
        studentId: user.userId,
        teacherId: survey.createdBy, // Обычно здесь должен быть ID преподавателя, привязанного к группе студента
        answers: formattedAnswers,
        submittedAt: new Date().toISOString(),
      });

      setSuccess(true);

      // Перенаправляем через 2 секунды
      setTimeout(() => {
        router.push("/student/surveys");
      }, 2000);
    } catch (error) {
      setError("Не удалось отправить ответы. Пожалуйста, попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!survey) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center p-6">
          {error || "Загрузка опросника..."}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
      <p className="text-gray-600 mb-6">{survey.description}</p>

      {success ? (
        <div className="bg-green-100 text-green-700 p-4 rounded-md">
          Ваши ответы успешно отправлены! Вы будете перенаправлены на страницу
          опросников.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {survey.questions.map((question: SurveyQuestion) => (
              <div
                key={question.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="text-lg font-medium mb-4">{question.text}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500">Низко (1)</span>
                  <span className="text-gray-500">Высоко (10)</span>
                </div>
                <div className="flex justify-between space-x-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAnswerChange(question.id, value)}
                      className={`w-full py-2 rounded focus:outline-none transition-colors ${
                        answers[question.id] === value
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
            >
              {isSubmitting ? "Отправка..." : "Отправить ответы"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
