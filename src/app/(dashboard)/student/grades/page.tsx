import StudentGrades from "@/components/student/StudentGrades";

export default function StudentGradesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Мои оценки</h1>
      <StudentGrades />
    </div>
  );
}
