// app/(dashboard)/admin/curators/page.tsx
import { CuratorCreationForm } from "@/components/admin/CuratorCreationForm";
import { CuratorsList } from "@/components/admin/CuratorsList";

export default function AdminCuratorsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Управление кураторами</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <CuratorCreationForm />
        </div>

        <div>
          <CuratorsList />
        </div>
      </div>
    </div>
  );
}
