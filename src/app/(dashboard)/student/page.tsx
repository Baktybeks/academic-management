import StudentAttendance from "@/components/student/StudentAttendance";
import Link from "next/link";

export default function StudentDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Панель студента</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/student/attendance"
          className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg shadow-md transition duration-200"
        >
          <h2 className="text-xl font-bold mb-2">Посещаемость</h2>
          <p>Просмотр вашей посещаемости занятий</p>
        </Link>

        <Link
          href="/student/grades"
          className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg shadow-md transition duration-200"
        >
          <h2 className="text-xl font-bold mb-2">Оценки</h2>
          <p>Просмотр ваших оценок за занятия</p>
        </Link>

        <Link
          href="/student/surveys"
          className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg shadow-md transition duration-200"
        >
          <h2 className="text-xl font-bold mb-2">Опросники</h2>
          <p>Прохождение опросников для оценки компетенций</p>
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">Последние посещения</h2>
      <StudentAttendance />
    </div>
  );
}
