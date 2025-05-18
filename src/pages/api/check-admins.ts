// pages/api/check-admins.ts
import { NextApiRequest, NextApiResponse } from "next";
import { appwriteConfig } from "@/constants/appwriteConfig";
import { Client, Databases, Query } from "appwrite";
import { UserRole } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);

    const database = new Databases(client);

    // Проверяем, есть ли пользователи с ролью ADMIN
    const adminCheck = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      [Query.equal("role", UserRole.ADMIN)]
    );

    // Если нет администраторов, значит это первый пользователь
    const isFirstUser = adminCheck.total === 0;

    return res.status(200).json({ isFirstUser });
  } catch (error) {
    console.error("Ошибка при проверке администраторов:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
}
