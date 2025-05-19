// hooks/useAuth.ts
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useActivateUser, useDeactivateUser } from "@/services/authService";

export const useAuth = () => {
  const {
    user,
    isLoading,
    error,
    checkAuth,
    login,
    logout,
    register,
    clearError,
  } = useAuthStore();

  // Добавляем хук для деактивации пользователя
  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Функция активации пользователя
  const activateUser = async (userId: string) => {
    try {
      await activateUserMutation.mutateAsync(userId);
      await checkAuth(); // Обновляем состояние после активации
    } catch (error) {
      throw error;
    }
  };

  // Новая функция для деактивации (блокировки) пользователя
  const deactivateUser = async (userId: string) => {
    try {
      await deactivateUserMutation.mutateAsync(userId);
      await checkAuth(); // Обновляем состояние после деактивации
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading:
      isLoading ||
      activateUserMutation.isPending ||
      deactivateUserMutation.isPending,
    error,
    login,
    logout,
    register,
    activateUser,
    deactivateUser, // Добавляем новую функцию в возвращаемые значения
    clearError,
  };
};
