// pages/index.tsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { UserRole } from "../types";
import Layout from "../components/common/Layout";
import { useAuth } from "@/hooks/useAuth";

const Home: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // useEffect(() => {
  //   if (!loading) {
  //     if (!user) {
  //       // Если пользователь не авторизован, перенаправляем на страницу входа
  //       router.push("/login");
  //     } else {
  //       // Перенаправляем в зависимости от роли пользователя
  //       if (user.role === UserRole.ADMIN) {
  //         router.push("/admin");
  //       } else if (user.role === UserRole.TEACHER) {
  //         router.push("/teacher");
  //       } else if (user.role === UserRole.CURATOR) {
  //         router.push("/curator");
  //       } else if (user.role === UserRole.STUDENT) {
  //         router.push("/student");
  //       }
  //     }
  //   }
  // }, [user, loading, router]);

  if (loading) {
    return (
      <Layout title="Загрузка...">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return null; // Не отображаем ничего, так как будет перенаправление
};

export default Home;
