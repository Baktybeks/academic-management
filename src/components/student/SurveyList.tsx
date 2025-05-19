"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { surveyApi } from "@/services/surveyService";
import { groupApi } from "@/services/groupService";
import { surveyResponseApi } from "@/services/surveyResponseService";
import { Survey, Group } from "@/types";
import Link from "next/link";

export function SurveyList() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState
    Array<Survey & { completed?: boolean }>
  >([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      // Проверяем, что у пользователя есть ID
      if (!user || !user.$id) {
        setLoading(false);
        setError("Не удалось получить информацию о пользователе");
        return;
      }

      try {
        setLoading(true);

        // Получаем все активные опросники
        const activeSurveys = await surveyApi.getActiveSurveys();

        // Получаем группы, в которых состоит студент
        const studentGroups = await groupApi.getGroupsByStudentId(user.$id);
        setGroups(studentGroups);

        // Для каждого опросника и каждой группы студента проверяем, проходил ли он его
        const surveysWithStatus = await Promise.all(
          activeSurveys
            // Фильтруем опросники без ID
            .filter(survey => Boolean(survey.$id))
            .map(async (survey) => {
              // Для каждой группы проверяем, проходил ли студент опросник для преподавателя этой группы
              const completedStatuses = await Promise.all(
                studentGroups
                  // Фильтруем группы без teacherId
                  .filter(group => Boolean(group.$id) && Boolean(group.teacherId))
                  .map(async (group) => {
                    if (!survey.$id || !group.teacherId) return false;
                    
                    return await surveyResponseApi.hasStudentCompletedSurvey(
                      survey.$id,
                      user.$id,
                      group.teacherId
                    );
                  })
              );

              // Если хотя бы для одной группы опросник не пройден, считаем его доступным
              const allCompleted = completedStatuses.every((status) => status);

              return { ...survey, completed: allCompleted };
            })
        );

        setSurveys(surveysWithStatus);
      } catch (err) {
        console.error("Ошибка при загрузке опросников:", err);
        setError("Не удалось загрузить доступные опросники");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-6">Загрузка доступных опросников...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  // Фильтруем только непройденные опросники
  const availableSurveys = surveys.filter((survey) => !survey.completed);

  if (availableSurveys.length === 0) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
        Вы прошли все доступные опросники. Спасибо за участие!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableSurveys.map((survey) => (
          // Проверяем наличие survey.$id
          survey.$id && (
            <div
              key={survey.$id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">{survey.title}</h3>
                <p className="text-gray-600 mb-4">{survey.description}</p>
                <Link
                  href={`/student/surveys/${survey.$id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-block"
                >
                  Пройти опросник
                </Link>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default SurveyList;