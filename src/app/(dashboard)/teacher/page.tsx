import TeacherGroups from "@/components/teacher/TeacherGroups";

export default function TeacherDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Панель преподавателя</h1>
      <TeacherGroups />
    </div>
  );
}
