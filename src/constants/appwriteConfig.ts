export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  collections: {
    users: process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users",
    groups: process.env.NEXT_PUBLIC_GROUPS_COLLECTION_ID || "groups",
    lessons: process.env.NEXT_PUBLIC_LESSONS_COLLECTION_ID || "lessons",
    attendance:
      process.env.NEXT_PUBLIC_ATTENDANCE_COLLECTION_ID || "attendance",
    surveys: process.env.NEXT_PUBLIC_SURVEYS_COLLECTION_ID || "surveys",
    surveyQuestions:
      process.env.NEXT_PUBLIC_SURVEY_QUESTIONS_COLLECTION_ID ||
      "survey_questions",
    surveyResponses:
      process.env.NEXT_PUBLIC_SURVEY_RESPONSES_COLLECTION_ID ||
      "survey_responses",
    surveyAnswers:
      process.env.NEXT_PUBLIC_SURVEY_ANSWERS_COLLECTION_ID || "survey_answers",
  },
};

const requiredEnvVars = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  "NEXT_PUBLIC_USERS_COLLECTION_ID",
  "NEXT_PUBLIC_GROUPS_COLLECTION_ID",
  "NEXT_PUBLIC_LESSONS_COLLECTION_ID",
  "NEXT_PUBLIC_ATTENDANCE_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEYS_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_QUESTIONS_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_RESPONSES_COLLECTION_ID",
  "NEXT_PUBLIC_SURVEY_ANSWERS_COLLECTION_ID",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    `Отсутствуют необходимые переменные окружения: ${missingEnvVars.join(", ")}`
  );
}
