// frontend/src/contexts/CookieConsentContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type ConsentCategories = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const CONSENT_KEY = "cookie-consent";
const CONSENT_TIMESTAMP_KEY = "cookie-consent-timestamp";
const CONSENT_EXPIRY_DAYS = 365;

const defaultConsent: ConsentCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
};

interface CookieConsentContextType {
  hasConsent: boolean | null;
  consent: ConsentCategories;
  showBanner: boolean;
  saveConsent: (newConsent: ConsentCategories) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  clearConsent: () => void;
  setShowBanner: (show: boolean) => void;
}

const CookieConsentContext = createContext<
  CookieConsentContextType | undefined
>(undefined);

export const CookieConsentProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [consent, setConsent] = useState<ConsentCategories>(defaultConsent);
  const [showBanner, setShowBanner] = useState(false);

  // Załaduj zgody z localStorage
  useEffect(() => {
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    const savedTimestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);

    if (savedConsent && savedTimestamp) {
      const timestamp = parseInt(savedTimestamp);
      const now = Date.now();
      const expiryTime = timestamp + CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (now < expiryTime) {
        const parsed = JSON.parse(savedConsent) as ConsentCategories;
        setConsent(parsed);
        setHasConsent(true);
        updateGoogleConsent(parsed);
      } else {
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
        setShowBanner(true);
        setHasConsent(false);
        updateGoogleConsent(defaultConsent);
      }
    } else {
      setShowBanner(true);
      setHasConsent(false);
      updateGoogleConsent(defaultConsent);
    }
  }, []);

  const saveConsent = useCallback((newConsent: ConsentCategories) => {
    const consentToSave = { ...newConsent, necessary: true };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentToSave));
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, Date.now().toString());
    setConsent(consentToSave);
    setHasConsent(true);
    setShowBanner(false);
    updateGoogleConsent(consentToSave);
    window.location.reload();
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  }, [saveConsent]);

  const rejectAll = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  }, [saveConsent]);

  const clearConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
    setConsent(defaultConsent);
    setHasConsent(false);
    setShowBanner(true);
    updateGoogleConsent(defaultConsent);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        hasConsent,
        consent,
        showBanner,
        saveConsent,
        acceptAll,
        rejectAll,
        clearConsent,
        setShowBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider"
    );
  }
  return context;
};

function updateGoogleConsent(consent: ConsentCategories) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];

    const gtag = (...args: any[]) => {
      window.dataLayer!.push(args);
    };

    gtag("consent", "update", {
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
      analytics_storage: consent.analytics ? "granted" : "denied",
      functionality_storage: "granted",
      personalization_storage: consent.analytics ? "granted" : "denied",
      security_storage: "granted",
    });
  }
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
