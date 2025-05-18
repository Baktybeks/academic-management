import { create } from "zustand";
import { Group } from "@/types";
import { groupApi } from "@/services/groupService";

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  isLoading: boolean;
  error: string | null;

  fetchGroups: () => Promise<void>;
  fetchGroupById: (id: string) => Promise<void>;
  createGroup: (title: string, teacherId: string) => Promise<void>;
  updateGroup: (
    id: string,
    title: string,
    teacherId: string,
    studentIds: string[]
  ) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    try {
      set({ isLoading: true, error: null });
      const groups = await groupApi.getAllGroups();
      set({ groups, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchGroupById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const group = await groupApi.getGroupById(id);
      set({ currentGroup: group, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createGroup: async (title, teacherId) => {
    try {
      set({ isLoading: true, error: null });
      // Получаем текущего пользователя для createdBy
      // Предположим, что информация о текущем пользователе доступна
      const createdBy =
        JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user
          ?.$id || "";

      const group = await groupApi.createGroup(title, teacherId, createdBy);
      set({ groups: [...get().groups, group], isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateGroup: async (id, title, teacherId, studentIds) => {
    try {
      set({ isLoading: true, error: null });
      // Создаем объект с данными для обновления
      const data = {
        title,
        teacherId,
        studentIds,
      };

      const group = await groupApi.updateGroup(id, data);
      const updatedGroups = get().groups.map((g) => (g.$id === id ? group : g));
      set({ groups: updatedGroups, currentGroup: group, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteGroup: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await groupApi.deleteGroup(id);
      set({
        groups: get().groups.filter((group) => group.$id !== id),
        currentGroup:
          get().currentGroup?.$id === id ? null : get().currentGroup,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
