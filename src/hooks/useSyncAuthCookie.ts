// hooks/useSyncAuthCookie.ts
"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

// Хук для синхронизации состояния аутентификации с куки для middleware
export const useSyncAuthCookie = () => {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      // Устанавливаем куки в формате, который ожидает middleware
      const cookieValue = JSON.stringify({ state: { user } });
      document.cookie = `auth-storage=${encodeURIComponent(
        cookieValue
      )}; path=/; max-age=${60 * 60 * 24 * 7}`;
    } else {
      // Удаляем куки при разлогинивании
      document.cookie = "auth-storage=; path=/; max-age=0";
    }
  }, [user]);
};
