import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Survey, SurveyQuestion } from "@/types";

export const surveyApi = {
  // Методы для работы с опросами
  getAllSurveys: async (): Promise<Survey[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys
      );
      return response.documents as unknown as Survey[];
    } catch (error) {
      console.error("Error fetching surveys:", error);
      return [];
    }
  },

  getActiveSurveys: async (): Promise<Survey[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        [Query.equal("isActive", true)]
      );
      return response.documents as unknown as Survey[];
    } catch (error) {
      console.error("Error fetching active surveys:", error);
      return [];
    }
  },

  getSurveyById: async (id: string): Promise<Survey | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        id
      );
      return response as unknown as Survey;
    } catch (error) {
      console.error("Error fetching survey:", error);
      return null;
    }
  },

  createSurvey: async (
    title: string,
    description: string,
    createdBy: string
  ): Promise<Survey> => {
    try {
      const data = {
        title,
        description,
        createdBy,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        ID.unique(),
        data
      );

      return response as unknown as Survey;
    } catch (error) {
      console.error("Error creating survey:", error);
      throw error;
    }
  },

  updateSurvey: async (id: string, data: Partial<Survey>): Promise<Survey> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        id,
        data
      );
      return response as unknown as Survey;
    } catch (error) {
      console.error("Error updating survey:", error);
      throw error;
    }
  },

  deleteSurvey: async (id: string): Promise<boolean> => {
    try {
      // Удаляем опрос
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        id
      );

      // Удаляем все вопросы опроса
      try {
        const questions = await surveyApi.getSurveyQuestions(id);
        for (const question of questions) {
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.surveyQuestions,
            question.$id
          );
        }
      } catch (error) {
        console.error("Error deleting survey questions:", error);
      }

      // Удаляем все ответы на опрос
      try {
        const responses = await surveyApi.getSurveyResponses(id);
        for (const response of responses) {
          // Удаляем все ответы на вопросы для этого ответа на опрос
          try {
            const answers = await surveyApi.getSurveyAnswersByResponse(
              response.$id
            );
            for (const answer of answers) {
              await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.surveyAnswers,
                answer.$id
              );
            }
          } catch (error) {
            console.error("Error deleting survey answers:", error);
          }

          // Удаляем сам ответ на опрос
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.surveyResponses,
            response.$id
          );
        }
      } catch (error) {
        console.error("Error deleting survey responses:", error);
      }

      return true;
    } catch (error) {
      console.error("Error deleting survey:", error);
      throw error;
    }
  },

  // Методы для работы с вопросами опроса
  getSurveyQuestions: async (surveyId: string): Promise<SurveyQuestion[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        [Query.equal("surveyId", surveyId)]
      );
      return response.documents as unknown as SurveyQuestion[];
    } catch (error) {
      console.error("Error fetching survey questions:", error);
      return [];
    }
  },

  createSurveyQuestion: async (
    surveyId: string,
    text: string
  ): Promise<SurveyQuestion> => {
    try {
      const data = {
        surveyId,
        text,
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        ID.unique(),
        data
      );

      return response as unknown as SurveyQuestion;
    } catch (error) {
      console.error("Error creating survey question:", error);
      throw error;
    }
  },

  updateSurveyQuestion: async (
    id: string,
    text: string
  ): Promise<SurveyQuestion> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        id,
        { text }
      );
      return response as unknown as SurveyQuestion;
    } catch (error) {
      console.error("Error updating survey question:", error);
      throw error;
    }
  },

  deleteSurveyQuestion: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        id
      );

      // Удаляем все ответы на этот вопрос
      try {
        const answers = await surveyApi.getSurveyAnswersByQuestion(id);
        for (const answer of answers) {
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.surveyAnswers,
            answer.$id
          );
        }
      } catch (error) {
        console.error("Error deleting survey answers:", error);
      }

      return true;
    } catch (error) {
      console.error("Error deleting survey question:", error);
      throw error;
    }
  },

  // Методы для работы с ответами на опросы
  getSurveyWithQuestions: async (
    surveyId: string
  ): Promise<{
    survey: Survey | null;
    questions: SurveyQuestion[];
  }> => {
    try {
      const survey = await surveyApi.getSurveyById(surveyId);
      const questions = await surveyApi.getSurveyQuestions(surveyId);

      return {
        survey,
        questions,
      };
    } catch (error) {
      console.error("Error fetching survey with questions:", error);
      return {
        survey: null,
        questions: [],
      };
    }
  },

  getSurveyResponses: async (surveyId: string): Promise<any[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        [Query.equal("surveyId", surveyId)]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching survey responses:", error);
      return [];
    }
  },

  getSurveyResponsesByStudent: async (studentId: string): Promise<any[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        [Query.equal("studentId", studentId)]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching survey responses by student:", error);
      return [];
    }
  },

  createSurveyResponse: async (
    surveyId: string,
    studentId: string,
    teacherId: string
  ): Promise<any> => {
    try {
      const data = {
        surveyId,
        studentId,
        teacherId,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        ID.unique(),
        data
      );

      return response;
    } catch (error) {
      console.error("Error creating survey response:", error);
      throw error;
    }
  },

  // Методы для работы с ответами на вопросы
  getSurveyAnswersByResponse: async (responseId: string): Promise<any[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyAnswers,
        [Query.equal("responseId", responseId)]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching survey answers by response:", error);
      return [];
    }
  },

  getSurveyAnswersByQuestion: async (questionId: string): Promise<any[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyAnswers,
        [Query.equal("questionId", questionId)]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching survey answers by question:", error);
      return [];
    }
  },

  createSurveyAnswer: async (
    responseId: string,
    questionId: string,
    value: number
  ): Promise<any> => {
    try {
      // Убедимся, что значение в пределах от 1 до 10
      const sanitizedValue = Math.min(Math.max(1, value), 10);

      const data = {
        responseId,
        questionId,
        value: sanitizedValue,
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyAnswers,
        ID.unique(),
        data
      );

      return response;
    } catch (error) {
      console.error("Error creating survey answer:", error);
      throw error;
    }
  },

  // Метод для отправки полного ответа на опрос
  submitSurveyWithAnswers: async (
    surveyId: string,
    studentId: string,
    teacherId: string,
    answers: Array<{ questionId: string; value: number }>
  ): Promise<any> => {
    try {
      // Создаем запись ответа на опрос
      const surveyResponse = await surveyApi.createSurveyResponse(
        surveyId,
        studentId,
        teacherId
      );

      // Создаем ответы на вопросы
      const answerPromises = answers.map((answer) =>
        surveyApi.createSurveyAnswer(
          surveyResponse.$id,
          answer.questionId,
          answer.value
        )
      );

      const surveyAnswers = await Promise.all(answerPromises);

      return {
        response: surveyResponse,
        answers: surveyAnswers,
      };
    } catch (error) {
      console.error("Error submitting survey with answers:", error);
      throw error;
    }
  },

  // Метод для получения полных данных ответа на опрос
  getSurveyResponseWithAnswers: async (responseId: string): Promise<any> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyResponses,
        responseId
      );

      const answers = await surveyApi.getSurveyAnswersByResponse(responseId);

      return {
        response,
        answers,
      };
    } catch (error) {
      console.error("Error fetching survey response with answers:", error);
      throw error;
    }
  },
};
