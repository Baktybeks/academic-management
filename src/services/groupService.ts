// services/groupService.ts
import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Group } from "@/types";

// Обновленный интерфейс DTO для создания группы
export interface GroupCreateDto {
  title: string; // Изменено с name на title
  studentIds?: string[];
  teacherId: string; // Добавлено для соответствия схеме
  createdBy: string; // Добавлено для соответствия схеме
}

// Обновленный интерфейс DTO для обновления группы
export interface GroupUpdateDto {
  title?: string;
  studentIds?: string[];
  teacherId?: string;
}

export const groupApi = {
  getAllGroups: async (): Promise<Group[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups
      );
      return response.documents as unknown as Group[];
    } catch (error) {
      console.error("Error fetching groups:", error);
      return [];
    }
  },

  getGroupById: async (id: string): Promise<Group | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Error fetching group:", error);
      return null;
    }
  },

  createGroup: async (groupData: GroupCreateDto): Promise<Group> => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        ID.unique(),
        {
          title: groupData.title, // Изменено с name на title
          studentIds: groupData.studentIds || [],
          teacherId: groupData.teacherId, // Добавлено
          createdBy: groupData.createdBy, // Добавлено
          createdAt: new Date().toISOString(),
        }
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  },

  updateGroup: async (
    id: string,
    groupData: GroupUpdateDto // Обновлен тип
  ): Promise<Group> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id,
        groupData
      );
      return response as unknown as Group;
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  },

  deleteGroup: async (id: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id
      );
      return true;
    } catch (error) {
      console.error("Error deleting group:", error);
      throw error;
    }
  },

  getGroupsByStudentId: async (studentId: string): Promise<Group[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        [Query.search("studentIds", studentId)]
      );
      return response.documents as unknown as Group[];
    } catch (error) {
      console.error("Error fetching groups by student:", error);
      return [];
    }
  },

  // Добавлена новая функция для получения групп по ID преподавателя
  getGroupsByTeacherId: async (teacherId: string): Promise<Group[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        [Query.equal("teacherId", teacherId)]
      );
      return response.documents as unknown as Group[];
    } catch (error) {
      console.error("Error fetching groups by teacher:", error);
      return [];
    }
  },
};
