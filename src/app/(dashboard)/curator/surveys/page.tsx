import { SurveyManagement } from "@/components/curator/SurveyManagement";

export default function CuratorSurveysPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Управление опросниками</h1>
      <SurveyManagement />
    </div>
  );
}
