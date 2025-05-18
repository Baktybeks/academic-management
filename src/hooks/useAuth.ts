import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useActivateUser } from "@/services/authService";

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

  const activateUserMutation = useActivateUser();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const activateUser = async (userId: string) => {
    try {
      await activateUserMutation.mutateAsync(userId);
      await checkAuth();
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading: isLoading || activateUserMutation.isPending,
    error,
    login,
    logout,
    register,
    activateUser,
    clearError,
  };
};
