import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Lesson, Attendance } from "@/types";

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

  createLesson: async (
    title: string,
    description: string,
    date: string,
    groupId: string,
    teacherId: string
  ): Promise<Lesson> => {
    try {
      const data = {
        title,
        description,
        date,
        groupId,
        teacherId,
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        ID.unique(),
        data
      );

      return response as unknown as Lesson;
    } catch (error) {
      console.error("Error creating lesson:", error);
      throw error;
    }
  },

  updateLesson: async (id: string, data: Partial<Lesson>): Promise<Lesson> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.lessons,
        id,
        data
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

      // Удаляем также все записи посещаемости для этого урока
      try {
        const attendances = await lessonApi.getAttendanceByLesson(id);
        for (const attendance of attendances) {
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.attendance,
            attendance.$id
          );
        }
      } catch (error) {
        console.error("Error deleting related attendance records:", error);
      }

      return true;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      throw error;
    }
  },

  // Методы для работы с посещаемостью
  getAttendanceByLesson: async (lessonId: string): Promise<Attendance[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("lessonId", lessonId)]
      );
      return response.documents as unknown as Attendance[];
    } catch (error) {
      console.error("Error fetching attendance by lesson:", error);
      return [];
    }
  },

  getAttendanceByStudent: async (studentId: string): Promise<Attendance[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("studentId", studentId)]
      );
      return response.documents as unknown as Attendance[];
    } catch (error) {
      console.error("Error fetching attendance by student:", error);
      return [];
    }
  },

  getStudentAttendanceForLesson: async (
    lessonId: string,
    studentId: string
  ): Promise<Attendance | null> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("lessonId", lessonId), Query.equal("studentId", studentId)]
      );

      if (response.documents.length > 0) {
        return response.documents[0] as unknown as Attendance;
      }

      return null;
    } catch (error) {
      console.error("Error fetching student attendance for lesson:", error);
      return null;
    }
  },

  createOrUpdateAttendance: async (
    lessonId: string,
    studentId: string,
    present: boolean,
    score: number
  ): Promise<Attendance> => {
    try {
      // Проверяем, существует ли уже запись
      const existingAttendance = await lessonApi.getStudentAttendanceForLesson(
        lessonId,
        studentId
      );

      if (existingAttendance) {
        // Обновляем существующую запись
        const response = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.attendance,
          existingAttendance.$id,
          { present, score }
        );

        return response as unknown as Attendance;
      } else {
        // Создаем новую запись
        const data = {
          lessonId,
          studentId,
          present,
          score,
          createdAt: new Date().toISOString(),
        };

        const response = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.collections.attendance,
          ID.unique(),
          data
        );

        return response as unknown as Attendance;
      }
    } catch (error) {
      console.error("Error creating/updating attendance:", error);
      throw error;
    }
  },
};
