// frontend/src/components/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Jeśli jest hash (kotwica), przewiń do elementu
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100); // Małe opóźnienie, żeby DOM zdążył się wyrenderować
    } else {
      // Jeśli nie ma hasha, przewiń do góry
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};
