import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { SurveyResponse, SurveyAnswer } from "@/types";

export interface SurveyResponseCreateDto {
  surveyId: string;
  studentId: string;
  teacherId: string;
}

export interface SurveyAnswerCreateDto {
  responseId: string;
  questionId: string;
  value: number;
}

export const surveyResponseApi = {
  // Проверка, проходил ли студент опросник
  hasStudentCompletedSurvey: async (
    surveyId: string,
    studentId: string,
    teacherId: string
  ): Promise<boolean> => {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.survey_responses,
        [
          Query.equal("surveyId", surveyId),
          Query.equal("studentId", studentId),
          Query.equal("teacherId", teacherId),
        ]
      );
      return result.total > 0;
    } catch (error) {
      console.error("Error checking survey completion:", error);
      return false;
    }
  },

  // Создание ответа на опросник
  createResponse: async (
    data: SurveyResponseCreateDto
  ): Promise<SurveyResponse> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.survey_responses,
        ID.unique(),
        {
          ...data,
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as SurveyResponse;
    } catch (error) {
      console.error("Error creating survey response:", error);
      throw error;
    }
  },

  // Создание ответа на вопрос
  createAnswer: async (data: SurveyAnswerCreateDto): Promise<SurveyAnswer> => {
    try {
      const answer = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.survey_answers,
        ID.unique(),
        {
          ...data,
          createdAt: new Date().toISOString(),
        }
      );
      return answer as unknown as SurveyAnswer;
    } catch (error) {
      console.error("Error creating survey answer:", error);
      throw error;
    }
  },

  // Получение ответов студента для конкретного опросника
  getStudentSurveyResponses: async (
    studentId: string
  ): Promise<SurveyResponse[]> => {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.survey_responses,
        [Query.equal("studentId", studentId)]
      );
      return result.documents as unknown as SurveyResponse[];
    } catch (error) {
      console.error("Error fetching student survey responses:", error);
      return [];
    }
  },

  // Получение всех ответов для конкретного ответа на опросник
  getAnswersForResponse: async (
    responseId: string
  ): Promise<SurveyAnswer[]> => {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.survey_answers,
        [Query.equal("responseId", responseId)]
      );
      return result.documents as unknown as SurveyAnswer[];
    } catch (error) {
      console.error("Error fetching survey answers:", error);
      return [];
    }
  },

  // Массовое создание ответов на вопросы
  bulkCreateAnswers: async (
    answers: SurveyAnswerCreateDto[]
  ): Promise<void> => {
    try {
      await Promise.all(
        answers.map((answer) => surveyResponseApi.createAnswer(answer))
      );
    } catch (error) {
      console.error("Error in bulk create answers:", error);
      throw error;
    }
  },
};
