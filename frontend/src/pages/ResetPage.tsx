// frontend/src/pages/ResetPage.tsx

import { Layout } from "@/components/layout/Layout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const ResetPasswordPage = () => {
  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <ResetPasswordForm />
      </div>
    </Layout>
  );
};
