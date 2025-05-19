// services/lessonService.ts
import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Lesson } from "@/types";

export interface LessonCreateDto {
  title: string;
  description?: string;
  date: string;
  groupId: string;
  teacherId: string;
}

export const lessonApi = {
  getAllLessons: async (): Promise<Lesson[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons
      );
      return response.documents as unknown as Lesson[];
    } catch (error) {
      console.error("Error fetching lessons:", error);
      return [];
    }
  },

  getLessonById: async (id: string): Promise<Lesson | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        id
      );
      return response as unknown as Lesson;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      return null;
    }
  },

  getLessonsByGroup: async (groupId: string): Promise<Lesson[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        [Query.equal("groupId", groupId)]
      );
      return response.documents as unknown as Lesson[];
    } catch (error) {
      console.error("Error fetching lessons by group:", error);
      return [];
    }
  },

  getLessonsByTeacher: async (teacherId: string): Promise<Lesson[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        [Query.equal("teacherId", teacherId)]
      );
      return response.documents as unknown as Lesson[];
    } catch (error) {
      console.error("Error fetching lessons by teacher:", error);
      return [];
    }
  },

  createLesson: async (lessonData: LessonCreateDto): Promise<Lesson> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        ID.unique(),
        {
          ...lessonData,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as Lesson;
    } catch (error) {
      console.error("Error creating lesson:", error);
      throw error;
    }
  },

  updateLesson: async (
    id: string,
    lessonData: Partial<LessonCreateDto>
  ): Promise<Lesson> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        id,
        lessonData
      );
      return response as unknown as Lesson;
    } catch (error) {
      console.error("Error updating lesson:", error);
      throw error;
    }
  },

  deleteLesson: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        id
      );
      return true;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      throw error;
    }
  },
};
