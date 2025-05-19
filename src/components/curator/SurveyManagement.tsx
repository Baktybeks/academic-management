// components/curator/SurveyManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { surveyApi } from "@/services/surveyService";
import { Survey, SurveyQuestion } from "@/types";

export function SurveyManagement() {
  const { user } = useAuth();

  // Состояния для списка опросников
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Состояния для формы создания опросника
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [processingForm, setProcessingForm] = useState(false);

  // Состояния для редактирования опросника
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);

  // Состояния для работы с вопросами
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(
    null
  );

  // Загрузка опросников при монтировании компонента
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        const surveysData = await surveyApi.getAllSurveys();
        setSurveys(surveysData);
      } catch (err: any) {
        console.error("Ошибка при загрузке опросников:", err);
        setError(
          "Не удалось загрузить опросники. Пожалуйста, попробуйте позже."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  // Загрузка вопросов при выборе опросника
  useEffect(() => {
    if (!selectedSurvey) {
      setQuestions([]);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const questionsData = await surveyApi.getQuestionsBySurveyId(
          selectedSurvey.$id!
        );
        setQuestions(questionsData);
      } catch (err: any) {
        console.error("Ошибка при загрузке вопросов:", err);
        setError("Не удалось загрузить вопросы опросника.");
      }
    };

    fetchQuestions();
  }, [selectedSurvey]);

  // Обработчик создания опросника
  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!surveyTitle.trim()) {
      setError("Название опросника не может быть пустым");
      return;
    }

    try {
      setProcessingForm(true);
      setError(null);

      // Создаем новый опросник
      const newSurvey = await surveyApi.createSurvey({
        title: surveyTitle,
        description: surveyDescription,
        createdBy: user?.$id || "",
        isActive: isActive,
      });

      // Обновляем список опросников
      setSurveys([...surveys, newSurvey]);

      // Сбрасываем форму
      resetSurveyForm();

      setSuccess("Опросник успешно создан");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при создании опросника:", err);
      setError(err.message || "Ошибка при создании опросника");
    } finally {
      setProcessingForm(false);
    }
  };

  // Обработчик обновления опросника
  const handleUpdateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingSurvey) {
      return;
    }

    if (!surveyTitle.trim()) {
      setError("Название опросника не может быть пустым");
      return;
    }

    try {
      setProcessingForm(true);
      setError(null);

      // Обновляем опросник
      const updatedSurvey = await surveyApi.updateSurvey(editingSurvey.$id!, {
        title: surveyTitle,
        description: surveyDescription,
        isActive: isActive,
      });

      // Обновляем список опросников
      setSurveys(
        surveys.map((survey) =>
          survey.$id === updatedSurvey.$id ? updatedSurvey : survey
        )
      );

      // Обновляем выбранный опросник, если он был выбран
      if (selectedSurvey && selectedSurvey.$id === updatedSurvey.$id) {
        setSelectedSurvey(updatedSurvey);
      }

      // Сбрасываем форму
      resetSurveyForm();

      setSuccess("Опросник успешно обновлен");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при обновлении опросника:", err);
      setError(err.message || "Ошибка при обновлении опросника");
    } finally {
      setProcessingForm(false);
    }
  };

  // Функция для начала редактирования опросника
  const startEditingSurvey = (survey: Survey) => {
    setEditingSurvey(survey);
    setSurveyTitle(survey.title);
    setSurveyDescription(survey.description);
    setIsActive(survey.isActive);
    setShowCreateForm(true);
  };

  // Обработчик удаления опросника
  const handleDeleteSurvey = async (surveyId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот опросник?")) {
      return;
    }

    try {
      await surveyApi.deleteSurvey(surveyId);

      // Обновляем список опросников
      setSurveys(surveys.filter((survey) => survey.$id !== surveyId));

      // Если удаляемый опросник был выбран, сбрасываем выбор
      if (selectedSurvey && selectedSurvey.$id === surveyId) {
        setSelectedSurvey(null);
      }

      setSuccess("Опросник успешно удален");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при удалении опросника:", err);
      setError(err.message || "Ошибка при удалении опросника");
    }
  };

  // Обработчик создания вопроса
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSurvey) {
      setError("Опросник не выбран");
      return;
    }

    if (!newQuestion.trim()) {
      setError("Текст вопроса не может быть пустым");
      return;
    }

    try {
      setProcessingForm(true);
      setError(null);

      // Создаем новый вопрос
      const createdQuestion = await surveyApi.createQuestion({
        surveyId: selectedSurvey.$id!,
        text: newQuestion,
      });

      // Обновляем список вопросов
      setQuestions([...questions, createdQuestion]);

      // Сбрасываем форму
      setNewQuestion("");

      setSuccess("Вопрос успешно добавлен");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при добавлении вопроса:", err);
      setError(err.message || "Ошибка при добавлении вопроса");
    } finally {
      setProcessingForm(false);
    }
  };

  // Обработчик обновления вопроса
  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingQuestion) {
      return;
    }

    if (!newQuestion.trim()) {
      setError("Текст вопроса не может быть пустым");
      return;
    }

    try {
      setProcessingForm(true);
      setError(null);

      // Обновляем вопрос
      const updatedQuestion = await surveyApi.updateQuestion(
        editingQuestion.$id!,
        newQuestion
      );

      // Обновляем список вопросов
      setQuestions(
        questions.map((question) =>
          question.$id === updatedQuestion.$id ? updatedQuestion : question
        )
      );

      // Сбрасываем форму
      setNewQuestion("");
      setEditingQuestion(null);

      setSuccess("Вопрос успешно обновлен");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при обновлении вопроса:", err);
      setError(err.message || "Ошибка при обновлении вопроса");
    } finally {
      setProcessingForm(false);
    }
  };

  // Обработчик удаления вопроса
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот вопрос?")) {
      return;
    }

    try {
      await surveyApi.deleteQuestion(questionId);

      // Обновляем список вопросов
      setQuestions(questions.filter((question) => question.$id !== questionId));

      setSuccess("Вопрос успешно удален");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Ошибка при удалении вопроса:", err);
      setError(err.message || "Ошибка при удалении вопроса");
    }
  };

  // Функция сброса формы опросника
  const resetSurveyForm = () => {
    setShowCreateForm(false);
    setEditingSurvey(null);
    setSurveyTitle("");
    setSurveyDescription("");
    setIsActive(false);
  };

  // Функция начала редактирования вопроса
  const startEditingQuestion = (question: SurveyQuestion) => {
    setEditingQuestion(question);
    setNewQuestion(question.text);
  };

  // Отображение формы создания/редактирования опросника
  const renderSurveyForm = () => (
    <form
      onSubmit={editingSurvey ? handleUpdateSurvey : handleCreateSurvey}
      className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200"
    >
      <h3 className="text-lg font-bold mb-4">
        {editingSurvey
          ? "Редактирование опросника"
          : "Создание нового опросника"}
      </h3>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="surveyTitle"
        >
          Название опросника
        </label>
        <input
          id="surveyTitle"
          type="text"
          placeholder="Введите название опросника"
          value={surveyTitle}
          onChange={(e) => setSurveyTitle(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="surveyDescription"
        >
          Описание опросника
        </label>
        <textarea
          id="surveyDescription"
          placeholder="Введите описание опросника"
          value={surveyDescription}
          onChange={(e) => setSurveyDescription(e.target.value)}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows={3}
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="mr-2"
          />
          <span className="text-gray-700 text-sm font-bold">Активен</span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={processingForm}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {processingForm
            ? editingSurvey
              ? "Сохранение..."
              : "Создание..."
            : editingSurvey
            ? "Сохранить изменения"
            : "Создать опросник"}
        </button>

        <button
          type="button"
          onClick={resetSurveyForm}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Отмена
        </button>
      </div>
    </form>
  );

  // Отображение списка опросников
  const renderSurveysList = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Описание
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Вопросов
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey) => (
            <tr
              key={survey.$id}
              className={
                selectedSurvey && selectedSurvey.$id === survey.$id
                  ? "bg-blue-50"
                  : ""
              }
              onClick={() => setSelectedSurvey(survey)}
            >
              <td className="py-2 px-4 border-b border-gray-200 cursor-pointer">
                {survey.title}
              </td>
              <td className="py-2 px-4 border-b border-gray-200 cursor-pointer">
                {survey.description.length > 50
                  ? `${survey.description.substring(0, 50)}...`
                  : survey.description}
              </td>
              <td className="py-2 px-4 border-b border-gray-200 cursor-pointer">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    survey.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {survey.isActive ? "Активен" : "Неактивен"}
                </span>
              </td>
              <td className="py-2 px-4 border-b border-gray-200 cursor-pointer">
                {selectedSurvey && selectedSurvey.$id === survey.$id
                  ? questions.length
                  : "—"}
              </td>
              <td className="py-2 px-4 border-b border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingSurvey(survey);
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                >
                  Изменить
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSurvey(survey.$id!);
                  }}
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

  // Отображение формы для работы с вопросами
  const renderQuestionsSection = () => (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-bold mb-4">
        Вопросы для опросника: {selectedSurvey?.title}
      </h3>

      <form
        onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
        className="mb-6"
      >
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Введите текст вопроса"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            required
            className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
          />
          <button
            type="submit"
            disabled={processingForm}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {processingForm
              ? "Сохранение..."
              : editingQuestion
              ? "Сохранить"
              : "Добавить"}
          </button>
          {editingQuestion && (
            <button
              type="button"
              onClick={() => {
                setEditingQuestion(null);
                setNewQuestion("");
              }}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Отмена
            </button>
          )}
        </div>
      </form>

      {questions.length === 0 ? (
        <p className="text-gray-500">Нет вопросов для этого опросника</p>
      ) : (
        <ul className="space-y-2">
          {questions.map((question, index) => (
            <li
              key={question.$id}
              className="flex items-center justify-between bg-white p-3 rounded shadow"
            >
              <span className="mr-2">{index + 1}.</span>
              <span className="flex-grow">{question.text}</span>
              <div>
                <button
                  onClick={() => startEditingQuestion(question)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question.$id!)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Управление опросниками</h2>

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Создать опросник
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

      {showCreateForm && renderSurveyForm()}

      {loading ? (
        <p className="text-gray-500">Загрузка опросников...</p>
      ) : surveys.length === 0 ? (
        <p className="text-gray-500">Нет созданных опросников</p>
      ) : (
        renderSurveysList()
      )}

      {selectedSurvey && renderQuestionsSection()}
    </div>
  );
}

export default SurveyManagement;
