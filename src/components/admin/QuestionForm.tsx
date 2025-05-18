// components/admin/QuestionForm.tsx
import React, { useState } from "react";
import { useCreateQuestion, useUpdateQuestion } from "@/services/testService"; // Новый импорт
import { Question } from "../../types";

interface QuestionFormProps {
  testId: string;
  initialQuestion?: Question;
  onSuccess?: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  testId,
  initialQuestion,
  onSuccess,
}) => {
  const [text, setText] = useState(initialQuestion?.text || "");
  const [options, setOptions] = useState<string[]>(
    initialQuestion?.options || ["", "", "", ""]
  );
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(
    initialQuestion?.correctOptionIndex || 0
  );
  const [error, setError] = useState<string | null>(null);

  // Используем мутации из testService
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();

  const isEditing = !!initialQuestion;
  const isSubmitting =
    createQuestionMutation.isPending || updateQuestionMutation.isPending;

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError("Текст вопроса обязателен");
      return;
    }

    // Проверка наличия всех вариантов ответа
    if (options.some((option) => !option.trim())) {
      setError("Все варианты ответа должны быть заполнены");
      return;
    }

    try {
      if (isEditing && initialQuestion.$id) {
        // Используем мутацию обновления вопроса
        await updateQuestionMutation.mutateAsync({
          id: initialQuestion.$id,
          text,
          options,
          correctOptionIndex,
          testId, // передаем testId для обновления кеша в React Query
        });
      } else {
        // Используем мутацию создания вопроса
        await createQuestionMutation.mutateAsync({
          testId,
          text,
          options,
          correctOptionIndex,
        });
      }

      // Сброс формы
      setText("");
      setOptions(["", "", "", ""]);
      setCorrectOptionIndex(0);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? "Редактировать вопрос" : "Добавить новый вопрос"}
      </h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="text"
          >
            Текст вопроса
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="text"
            placeholder="Введите вопрос"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Варианты ответов
          </label>

          {options.map((option, index) => (
            <div key={index} className="mb-2 flex items-center">
              <input
                type="radio"
                id={`correct-${index}`}
                name="correctOption"
                className="mr-2"
                checked={correctOptionIndex === index}
                onChange={() => setCorrectOptionIndex(index)}
              />
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder={`Вариант ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
              />
            </div>
          ))}

          <p className="text-sm text-gray-500 mt-2">
            Выберите правильный вариант ответа, отметив его кружком слева.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Сохранение..."
              : isEditing
              ? "Обновить вопрос"
              : "Добавить вопрос"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
