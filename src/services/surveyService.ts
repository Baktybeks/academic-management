// services/surveyService.ts
import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Survey, SurveyQuestion } from "@/types";

export interface SurveyCreateDto {
  title: string;
  description: string;
  createdBy: string;
  isActive: boolean;
}

export interface SurveyQuestionCreateDto {
  surveyId: string;
  text: string;
}

export const surveyApi = {
  // Методы для работы с опросниками
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

  getSurveysByCreator: async (creatorId: string): Promise<Survey[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        [Query.equal("createdBy", creatorId)]
      );
      return response.documents as unknown as Survey[];
    } catch (error) {
      console.error("Error fetching surveys by creator:", error);
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

  createSurvey: async (surveyData: SurveyCreateDto): Promise<Survey> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        ID.unique(),
        {
          ...surveyData,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as Survey;
    } catch (error) {
      console.error("Error creating survey:", error);
      throw error;
    }
  },

  updateSurvey: async (
    id: string,
    surveyData: Partial<SurveyCreateDto>
  ): Promise<Survey> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        id,
        surveyData
      );
      return response as unknown as Survey;
    } catch (error) {
      console.error("Error updating survey:", error);
      throw error;
    }
  },

  deleteSurvey: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveys,
        id
      );
      return true;
    } catch (error) {
      console.error("Error deleting survey:", error);
      throw error;
    }
  },

  // Методы для работы с вопросами опросника
  getQuestionsBySurveyId: async (
    surveyId: string
  ): Promise<SurveyQuestion[]> => {
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

  createQuestion: async (
    questionData: SurveyQuestionCreateDto
  ): Promise<SurveyQuestion> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        ID.unique(),
        {
          ...questionData,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as SurveyQuestion;
    } catch (error) {
      console.error("Error creating survey question:", error);
      throw error;
    }
  },

  updateQuestion: async (id: string, text: string): Promise<SurveyQuestion> => {
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

  deleteQuestion: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.surveyQuestions,
        id
      );
      return true;
    } catch (error) {
      console.error("Error deleting survey question:", error);
      throw error;
    }
  },
};
