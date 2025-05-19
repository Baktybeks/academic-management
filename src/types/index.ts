// lib/types.ts
export enum UserRole {
  ADMIN = "admin",
  CURATOR = "curator",
  TEACHER = "teacher",
  STUDENT = "student",
}

export interface User {
  $id?: string; // ID документа в Appwrite
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Group {
  $id?: string;
  title: string; // Название группы
  studentIds: string[]; // Массив ID студентов
  teacherId: string; // ID преподавателя группы
  createdBy: string; // ID пользователя, создавшего группу
  createdAt: string;
}

export interface Lesson {
  $id?: string;
  title: string;
  description?: string; // Необязательное поле
  date: string; // Дата урока
  groupId: string; // ID группы
  teacherId: string; // ID преподавателя
  createdAt: string;
}

export interface Attendance {
  $id?: string;
  lessonId: string; // ID урока
  studentId: string; // ID студента
  present: boolean; // Присутствие
  score: number; // Оценка
  createdAt: string;
}

export interface Survey {
  $id?: string;
  title: string; // Название опроса
  description: string; // Описание опроса
  createdBy: string; // ID создателя
  isActive: boolean; // Активен ли опрос
  createdAt: string;
}

export interface SurveyQuestion {
  $id?: string;
  surveyId: string; // ID опроса
  text: string; // Текст вопроса
  createdAt: string;
}

export interface SurveyResponse {
  $id?: string;
  surveyId: string; // ID опроса
  studentId: string; // ID студента
  teacherId: string; // ID преподавателя
  submittedAt: string; // Время отправки ответа
  createdAt: string;
}

export interface SurveyAnswer {
  $id?: string;
  responseId: string; // ID ответа
  questionId: string; // ID вопроса
  value: number; // Числовая оценка (значение ответа)
  createdAt: string;
}
