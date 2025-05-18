// services/authService.ts
import { appwriteConfig } from "@/constants/appwriteConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, Account, ID, Databases, Query } from "appwrite";
import { User, UserRole } from "@/types";
import { toast } from "react-toastify";

// Константы для Appwrite
const {
  projectId: PROJECT_ID,
  endpoint: ENDPOINT,
  databaseId: DATABASE_ID,
  collections,
} = appwriteConfig;

console.log(PROJECT_ID, "PROJECT_ID");
console.log(DATABASE_ID, "DATABASE_ID");
console.log(ENDPOINT, "ENDPOINT");

export type GetUserResult = User | { notActivated: true } | null;

// Инициализация клиента Appwrite
const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

const account = new Account(client);
const database = new Databases(client);

// API функции для аутентификации
export const authApi = {
  // Проверка текущей сессии
  getCurrentUser: async (): Promise<User | null | { notActivated: true }> => {
    try {
      console.log("Получаем текущую сессию пользователя...");

      // Получаем текущую сессию с обработкой 401 ошибки
      let session;
      try {
        session = await account.get();
      } catch (err: any) {
        // Если пользователь не авторизован, просто вернем null
        if (err.code === 401) {
          console.log("Пользователь не авторизован (гость)");
          return null;
        }
        // Если ошибка другая, пробросим ее дальше
        throw err;
      }

      if (!session) {
        console.log("Сессия не найдена");
        return null;
      }

      // Получаем данные пользователя из базы данных
      const users = await database.listDocuments(
        DATABASE_ID,
        collections.users,
        [Query.equal("userId", session.$id)]
      );

      if (users.documents.length === 0) {
        console.log("Информация о пользователе не найдена в базе данных");
        return null;
      }

      const userData = users.documents[0];

      // Проверяем, активирован ли пользователь
      if (!userData.isActive && userData.role === UserRole.TEACHER) {
        console.log("Пользователь не активирован");
        // Не удаляем сессию здесь, чтобы предоставить информацию в login
        return { notActivated: true };
      }

      console.log("Пользователь найден:", userData.name);
      return userData as unknown as User;
    } catch (error) {
      console.error("Ошибка при получении текущего пользователя:", error);
      return null;
    }
  },

  // Регистрация
  register: async (
    name: string,
    email: string,
    password: string,
    role?: UserRole
  ): Promise<User> => {
    try {
      console.log(`Регистрация пользователя: ${email}...`);

      const adminCheck = await database.listDocuments(
        DATABASE_ID,
        collections.users,
        [Query.equal("role", UserRole.ADMIN)]
      );

      const userRole =
        adminCheck.total === 0 ? UserRole.ADMIN : UserRole.TEACHER;

      const finalRole =
        adminCheck.total === 0 ? UserRole.ADMIN : role || UserRole.TEACHER;

      const response = await account.create(ID.unique(), email, password, name);

      // Создаем документ пользователя в базе данных
      const userData = {
        userId: response.$id,
        email,
        name,
        role: finalRole,
        isActive: finalRole === UserRole.ADMIN ? true : false,
        createdAt: new Date().toISOString(),
      };

      const user = await database.createDocument(
        DATABASE_ID,
        collections.users,
        ID.unique(),
        userData
      );

      console.log("Пользователь успешно зарегистрирован:", user.$id);
      if (finalRole === UserRole.ADMIN) {
        console.log(
          "Пользователь назначен администратором (первый пользователь в системе)"
        );
      }
      return user as unknown as User;
    } catch (error) {
      console.error("Ошибка при регистрации пользователя:", error);
      throw error;
    }
  },
  // Вход в систему
  login: async (email: string, password: string): Promise<User> => {
    try {
      console.log(`Вход пользователя: ${email}...`);

      // Сначала проверим, нет ли уже существующей сессии
      let existingUser = null;
      try {
        existingUser = await authApi.getCurrentUser();
      } catch (e) {
        // Ничего не делаем, просто продолжаем
      }

      // Если сессия уже существует, удаляем ее
      if (existingUser) {
        await account.deleteSession("current");
      }

      // Создаем новую сессию
      await account.createEmailPasswordSession(email, password);

      // Проверяем данные пользователя
      const userResult = await authApi.getCurrentUser();

      // Проверяем статус активации
      if (
        userResult &&
        typeof userResult === "object" &&
        "notActivated" in userResult
      ) {
        // Удаляем сессию для неактивированного пользователя
        await account.deleteSession("current");
        // Выводим требуемое сообщение
        toast.success("Ожидайте активации вашего аккаунта администратором.");
        // throw new Error("Ожидайте активации вашего аккаунта администратором.");
      }

      if (!userResult) {
        throw new Error("Не удалось получить данные пользователя");
      }
      return userResult as User;
    } catch (error: any) {
      // Если это ошибка о создании дублирующей сессии, заменяем ее на сообщение об активации
      if (
        error.message &&
        error.message.includes(
          "Creation of a session is prohibited when a session is active"
        )
      ) {
        console.error("Обнаружена активная сессия");

        // Проверяем, не является ли текущий пользователь неактивированным
        const currentUser = await authApi.getCurrentUser();
        if (
          currentUser &&
          typeof currentUser === "object" &&
          "notActivated" in currentUser
        ) {
          // Если неактивирован, меняем сообщение об ошибке
          // throw new Error(
          //   "Ожидайте активации вашего аккаунта администратором."
          // );
          toast.success("Ожидайте активации вашего аккаунта администратором.");
        }
      }
      console.error("Ошибка при входе в систему:", error);
      throw error;
    }
  },

  // Выход из системы
  logout: async (): Promise<boolean> => {
    try {
      console.log("Выход из системы...");

      await account.deleteSession("current");

      console.log("Сессия успешно удалена");
      return true;
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
      throw error;
    }
  },

  // Активация пользователя
  activateUser: async (userId: string): Promise<User> => {
    try {
      console.log(`Активация пользователя с ID: ${userId}...`);

      const user = await database.updateDocument(
        DATABASE_ID,
        collections.users,
        userId,
        { isActive: true }
      );

      console.log("Пользователь успешно активирован");
      return user as unknown as User;
    } catch (error) {
      console.error("Ошибка при активации пользователя:", error);
      throw error;
    }
  },
};

// Ключи для React Query
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  users: () => [...authKeys.all, "users"] as const,
  pendingUsers: () => [...authKeys.all, "pending"] as const,
};

// React Query хуки
export const useCurrentUser = () => {
  return useQuery<GetUserResult>({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      email,
      password,
      role,
    }: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    }) => authApi.register(name, email, password, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user(), null);
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => authApi.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      queryClient.invalidateQueries({ queryKey: authKeys.pendingUsers() });
    },
  });
};

// Хук для получения списка неактивированных пользователей
export const usePendingUsers = () => {
  return useQuery({
    queryKey: authKeys.pendingUsers(),
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users,
          [
            Query.equal("isActive", false),
            Query.equal("role", UserRole.TEACHER),
          ]
        );

        return result.documents as unknown as User[];
      } catch (error) {
        console.error(
          "Ошибка при получении неактивированных пользователей:",
          error
        );
        return [];
      }
    },
  });
};

// Хук для получения списка преподавателей
export const useTeachers = () => {
  return useQuery({
    queryKey: [...authKeys.users(), "teachers"],
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users,
          [Query.equal("role", UserRole.TEACHER)]
        );

        return result.documents as unknown as User[];
      } catch (error) {
        console.error("Ошибка при получении списка преподавателей:", error);
        return [];
      }
    },
  });
};

// Хук для получения всех пользователей
export const useAllUsers = () => {
  return useQuery({
    queryKey: authKeys.users(),
    queryFn: async () => {
      try {
        const result = await database.listDocuments(
          DATABASE_ID,
          collections.users
        );

        return result.documents as unknown as User[];
      } catch (error) {
        console.error("Ошибка при получении списка пользователей:", error);
        return [];
      }
    },
  });
};
