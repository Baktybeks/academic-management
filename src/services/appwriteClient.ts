import { Client, Account, Databases, Storage } from "appwrite";
import { appwriteConfig } from "@/constants/appwriteConfig";

export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
