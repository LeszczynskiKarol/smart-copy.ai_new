// frontend/src/lib/recaptcha.ts

import { config } from "@/config";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

let recaptchaLoaded = false;

export const loadRecaptcha = (): Promise<void> => {
  if (recaptchaLoaded || window.grecaptcha) {
    recaptchaLoaded = true;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${config.recaptchaSiteKey}`;
    script.onload = () => {
      recaptchaLoaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });
};

export const executeRecaptcha = (action: string): Promise<string> => {
  return new Promise((resolve) => {
    const checkRecaptcha = setInterval(() => {
      if (window.grecaptcha?.execute) {
        clearInterval(checkRecaptcha);
        window.grecaptcha
          .execute("6Lc1qGYpAAAAANdix_8SfM46knnrZpyz9dTFZerW", { action })
          .then(resolve);
      }
    }, 100);
  });
};
