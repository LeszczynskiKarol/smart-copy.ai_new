// frontend/src/pages/RegisterPage.tsx

import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const RegisterPage = () => {
  <Helmet>
    <meta name="robots" content="noindex, nofollow" />
  </Helmet>;
  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <RegisterForm />
      </div>
    </Layout>
  );
};
