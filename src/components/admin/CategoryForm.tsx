// components/admin/CategoryForm.tsx (обновленная версия)
import React, { useState } from "react";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/services/categoryService";
import { Category } from "@/types";
import { useAuth } from "@/context/AuthProvider";

interface CategoryFormProps {
  initialCategory?: Category;
  onSuccess?: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialCategory,
  onSuccess,
}) => {
  const [name, setName] = useState(initialCategory?.name || "");
  const [description, setDescription] = useState(
    initialCategory?.description || ""
  );
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const isEditing = !!initialCategory;
  const isSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Название категории обязательно");
      return;
    }

    try {
      if (isEditing && initialCategory.$id) {
        await updateCategoryMutation.mutateAsync({
          id: initialCategory.$id,
          name,
          description,
        });
      } else if (user && user.$id) {
        await createCategoryMutation.mutateAsync({
          name,
          description,
          userId: user.$id,
        });
      } else {
        setError("Пользователь не авторизован");
        return;
      }

      setName("");
      setDescription("");

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
        {isEditing ? "Редактировать категорию" : "Создать новую категорию"}
      </h2>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {(createCategoryMutation.error || updateCategoryMutation.error) && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">
            {(
              (createCategoryMutation.error ||
                updateCategoryMutation.error) as Error
            ).message || "Ошибка сохранения категории"}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Название
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Название категории"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Описание
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            placeholder="Описание категории"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
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
              ? "Обновить категорию"
              : "Создать категорию"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
