import { GroupManagement } from "@/components/curator/GroupManagement";

export default function GroupsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Управление группами</h1>
      <GroupManagement />
    </div>
  );
}
