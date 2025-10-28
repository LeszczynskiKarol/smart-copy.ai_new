// frontend/src/pages/admin/AdminDashboard.tsx

import { AdminLayout } from "@/components/layout/AdminLayout";

export const AdminDashboard = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Admin Dashboard
      </h1>
      {/* Stats, charts, etc. */}
    </AdminLayout>
  );
};
