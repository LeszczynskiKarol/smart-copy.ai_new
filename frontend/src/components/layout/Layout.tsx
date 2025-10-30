// frontend/src/components/layout/Layout.tsx

import { ReactNode } from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  showBreadcrumbs?: boolean;
}

export const Layout = ({
  children,
  showFooter = true,
  showBreadcrumbs = false,
}: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showBreadcrumbs && <Breadcrumbs />}
      <main className="flex-1 pt-16">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};
