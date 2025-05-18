import { ID, Query } from "appwrite";
import { databases } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Group, User } from "@/types";

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

  createGroup: async (
    title: string,
    teacherId: string,
    createdBy: string
  ): Promise<Group> => {
    try {
      const data = {
        title,
        teacherId,
        studentIds: [],
        createdBy,
        createdAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        ID.unique(),
        data
      );

      return response as unknown as Group;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  },

  updateGroup: async (id: string, data: Partial<Group>): Promise<Group> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.groups,
        id,
        data
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

  getGroupsByTeacher: async (teacherId: string): Promise<Group[]> => {
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

  addStudentToGroup: async (
    groupId: string,
    studentId: string
  ): Promise<Group> => {
    try {
      // Сначала получаем текущую группу
      const group = await groupApi.getGroupById(groupId);
      if (!group) {
        throw new Error("Group not found");
      }

      // Добавляем студента, если его еще нет в группе
      if (!group.studentIds.includes(studentId)) {
        const updatedStudentIds = [...group.studentIds, studentId];

        return await groupApi.updateGroup(groupId, {
          studentIds: updatedStudentIds,
        });
      }

      return group;
    } catch (error) {
      console.error("Error adding student to group:", error);
      throw error;
    }
  },

  removeStudentFromGroup: async (
    groupId: string,
    studentId: string
  ): Promise<Group> => {
    try {
      // Сначала получаем текущую группу
      const group = await groupApi.getGroupById(groupId);
      if (!group) {
        throw new Error("Group not found");
      }

      // Удаляем студента из группы
      const updatedStudentIds = group.studentIds.filter(
        (id) => id !== studentId
      );

      return await groupApi.updateGroup(groupId, {
        studentIds: updatedStudentIds,
      });
    } catch (error) {
      console.error("Error removing student from group:", error);
      throw error;
    }
  },

  getStudentsInGroup: async (groupId: string): Promise<User[]> => {
    try {
      // Получаем группу
      const group = await groupApi.getGroupById(groupId);
      if (!group) {
        throw new Error("Group not found");
      }

      if (group.studentIds.length === 0) {
        return [];
      }

      // Получаем всех студентов из группы
      const studentQueries = group.studentIds.map((id) =>
        Query.equal("$id", id)
      );

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.or(studentQueries)]
      );

      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Error fetching students in group:", error);
      return [];
    }
  },
};
