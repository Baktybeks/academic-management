import { LessonManagement } from "@/components/curator/LessonManagement";

export default function CuratorLessonsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Управление уроками</h1>
      <LessonManagement />
    </div>
  );
}
