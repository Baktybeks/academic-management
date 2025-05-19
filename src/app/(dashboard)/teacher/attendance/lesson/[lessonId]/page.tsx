import AttendanceManagement from "@/components/teacher/AttendanceManagement";

export default function AttendancePage({
  params,
}: {
  params: { lessonId: string };
}) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Отметка посещаемости</h1>
      <AttendanceManagement lessonId={params.lessonId} />
    </div>
  );
}
