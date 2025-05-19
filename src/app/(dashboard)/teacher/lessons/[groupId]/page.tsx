import LessonManagement from "@/components/teacher/LessonManagement";

export default function LessonsPage({
  params,
}: {
  params: { groupId: string };
}) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Управление уроками</h1>
      <LessonManagement groupId={params.groupId} />
    </div>
  );
}
