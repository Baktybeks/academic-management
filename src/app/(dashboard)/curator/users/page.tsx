import UserManagementPage from "@/components/curator/UserManagementPage";

export default function CuratorUsersPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Управление пользователями</h1>
      <UserManagementPage />
    </div>
  );
}
