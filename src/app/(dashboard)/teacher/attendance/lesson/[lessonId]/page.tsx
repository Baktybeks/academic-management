"use client";

import { useParams } from "next/navigation";
import AttendanceManagement from "@/components/teacher/AttendanceManagement";

export default function AttendancePage() {
  const params = useParams();
  const lessonId = params.lessonId as string;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Отметка посещаемости</h1>
      <AttendanceManagement lessonId={lessonId} />
    </div>
  );
}
