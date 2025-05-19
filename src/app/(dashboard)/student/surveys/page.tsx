import SurveyList from "@/components/student/SurveyList";

export default function SurveysPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Доступные опросники</h1>
      <SurveyList />
    </div>
  );
}
