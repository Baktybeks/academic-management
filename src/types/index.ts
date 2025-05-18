// lib/types.ts
export enum UserRole {
  ADMIN = "admin",
  CURATOR = "curator",
  TEACHER = "teacher",
  STUDENT = "student",
}

export interface User {
  $id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  groupId?: string;
  createdAt: string;
}

export interface Group {
  $id: string;
  title: string;
  studentIds: string[];
  teacherId: string;
  createdBy: string;
  createdAt: string;
}

export interface Lesson {
  $id: string;
  title: string;
  description: string;
  date: string;
  groupId: string;
  teacherId: string;
  createdAt: string;
}

export interface Attendance {
  $id: string;
  lessonId: string;
  studentId: string;
  present: boolean;
  score: number;
  createdAt: string;
}

export interface SurveyQuestion {
  $id: string;
  surveyId: string;
  text: string;
  createdAt: string;
}

export interface Survey {
  $id: string;
  title: string;
  description: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

export interface SurveyResponse {
  $id: string;
  surveyId: string;
  studentId: string;
  teacherId: string;
  submittedAt: string;
  createdAt: string;
}

export interface SurveyAnswer {
  $id: string;
  responseId: string;
  questionId: string;
  value: number;
  createdAt: string;
}
