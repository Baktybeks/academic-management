// pages/teacher/tests.tsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { UserRole } from "../../types";
import Layout from "../../components/common/Layout";
import TestList from "../../components/teacher/TestList";
import { useAuth } from "@/context/AuthProvider";

const TeacherTests: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль преподавателя
    if (!loading && (!user || user.role !== UserRole.TEACHER)) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
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

  // Если пользователь не преподаватель, не отображаем ничего (будет перенаправление)
  if (user.role !== UserRole.TEACHER) {
    return null;
  }

  return (
    <Layout title="Доступные тесты">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Доступные тесты</h1>

        <TestList />
      </div>
    </Layout>
  );
};

export default TeacherTests;
