import StudentAttendance from "@/omponents/student/StudentAttendance";

export default function StudentAttendancePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Моя посещаемость</h1>
      <StudentAttendance />
    </div>
  );
}
