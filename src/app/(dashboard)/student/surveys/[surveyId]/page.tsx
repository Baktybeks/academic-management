"use client";

import SurveyCompletion from "@/components/student/SurveyCompletion";
import { useParams } from "next/navigation";

export default function SurveyCompletionPage() {
  const params = useParams();
  const surveyId = params.surveyId as string;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Прохождение опросника</h1>
      <SurveyCompletion surveyId={surveyId} />
    </div>
  );
}
