// services/userService.ts
import { ID, Query } from "appwrite";
import { databases, account } from "./appwriteClient";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { User, UserRole } from "@/types";

export const userApi = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  getUserById: async (id: string): Promise<User | null> => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        id
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.equal("role", role)]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return [];
    }
  },

  createUser: async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<User> => {
    try {
      // Создаем пользователя в системе аутентификации
      const newUser = await account.create(ID.unique(), email, password, name);

      // Создаем запись в коллекции users
      const userData = {
        name,
        email,
        role,
        isActive: role === UserRole.ADMIN, // Только админы сразу активированы
        createdAt: new Date().toISOString(),
      };

      const user = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        ID.unique(),
        userData
      );

      return user as unknown as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        id,
        data
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  activateUser: async (id: string): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        id,
        { isActive: true }
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Error activating user:", error);
      throw error;
    }
  },

  deactivateUser: async (id: string): Promise<User> => {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        id,
        { isActive: false }
      );
      return response as unknown as User;
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw error;
    }
  },

  getInactiveUsers: async (): Promise<User[]> => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.equal("isActive", false)]
      );
      return response.documents as unknown as User[];
    } catch (error) {
      console.error("Error fetching inactive users:", error);
      return [];
    }
  },
};
