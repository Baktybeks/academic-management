import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Attendance } from "@/types";

export interface AttendanceCreateDto {
  lessonId: string;
  studentId: string;
  present: boolean;
  score: number;
}

export const attendanceApi = {
  // Получение записей о посещаемости по ID урока
  getByLessonId: async (lessonId: string): Promise<Attendance[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("lessonId", lessonId)]
      );
      return response.documents as unknown as Attendance[];
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      return [];
    }
  },

  // Получение записей посещаемости для студента
  getByStudentId: async (studentId: string): Promise<Attendance[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("studentId", studentId)]
      );
      return response.documents as unknown as Attendance[];
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      return [];
    }
  },

  // Создание записи о посещаемости
  create: async (data: AttendanceCreateDto): Promise<Attendance> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        ID.unique(),
        {
          ...data,
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as Attendance;
    } catch (error) {
      console.error("Error creating attendance record:", error);
      throw error;
    }
  },

  // Обновление записи о посещаемости
  update: async (
    id: string,
    data: Partial<AttendanceCreateDto>
  ): Promise<Attendance> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        id,
        data
      );
      return response as unknown as Attendance;
    } catch (error) {
      console.error("Error updating attendance record:", error);
      throw error;
    }
  },

  // Получение или создание записи о посещаемости (для оптимизации)
  getOrCreate: async (
    lessonId: string,
    studentId: string
  ): Promise<Attendance> => {
    try {
      // Проверяем, существует ли уже запись
      const existing = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.attendance,
        [Query.equal("lessonId", lessonId), Query.equal("studentId", studentId)]
      );

      // Если запись найдена, возвращаем ее
      if (existing.documents.length > 0) {
        return existing.documents[0] as unknown as Attendance;
      }

      // Иначе создаем новую запись с дефолтными значениями
      return await attendanceApi.create({
        lessonId,
        studentId,
        present: false,
        score: 0,
      });
    } catch (error) {
      console.error("Error in getOrCreate:", error);
      throw error;
    }
  },

  // Массовое создание/обновление записей о посещаемости (для удобства работы)
  bulkUpsert: async (records: AttendanceCreateDto[]): Promise<void> => {
    try {
      // Используем Promise.all для параллельной обработки
      await Promise.all(
        records.map(async (record) => {
          const existing = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.attendance,
            [
              Query.equal("lessonId", record.lessonId),
              Query.equal("studentId", record.studentId),
            ]
          );

          if (existing.documents.length > 0) {
            // Обновляем существующую запись
            await databases.updateDocument(
              appwriteConfig.databaseId,
              appwriteConfig.collections.attendance,
              existing.documents[0].$id,
              {
                present: record.present,
                score: record.score,
              }
            );
          } else {
            // Создаем новую запись
            await attendanceApi.create(record);
          }
        })
      );
    } catch (error) {
      console.error("Error in bulk upsert:", error);
      throw error;
    }
  },
};
