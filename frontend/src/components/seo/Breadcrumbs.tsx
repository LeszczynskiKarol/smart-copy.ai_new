// frontend/src/components/seo/Breadcrumbs.tsx
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { StructuredData } from "./StructuredData";

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbList = {
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Strona główna",
        item: "https://www.smart-copy.ai",
      },
      ...pathnames.map((name, index) => {
        const url = `https://www.smart-copy.ai/${pathnames
          .slice(0, index + 1)
          .join("/")}`;
        return {
          "@type": "ListItem",
          position: index + 2,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          item: url,
        };
      }),
    ],
  };

  if (pathnames.length === 0) return null;

  return (
    <>
      <StructuredData type="BreadcrumbList" data={breadcrumbList} />
      <nav className="container-custom py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              to="/"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <Home className="w-4 h-4" />
            </Link>
          </li>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            return (
              <li key={name} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {isLast ? (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};
