"use client";

import { useParams } from "next/navigation";
import LessonManagement from "@/components/teacher/LessonManagement";

export default function LessonsPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Управление уроками</h1>
      <LessonManagement groupId={groupId} />
    </div>
  );
}
