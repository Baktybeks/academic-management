import SurveyCompletion from "@/components/student/SurveyCompletion";

export default function SurveyCompletionPage({
  params,
}: {
  params: { surveyId: string };
}) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Прохождение опросника</h1>
      <SurveyCompletion surveyId={params.surveyId} />
    </div>
  );
}
