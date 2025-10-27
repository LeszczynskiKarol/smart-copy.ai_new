// backend/src/utils/recaptcha.ts

import axios from "axios";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN_SCORE = parseFloat(
  process.env.RECAPTCHA_MIN_SCORE || "0.5"
);

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn("RECAPTCHA_SECRET_KEY not set, skipping verification");
    return true; // W development mode
  }

  try {
    const response = await axios.post<RecaptchaResponse>(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );

    const { success, score } = response.data;

    if (!success) {
      console.error(
        "reCAPTCHA verification failed:",
        response.data["error-codes"]
      );
      return false;
    }

    // Dla reCAPTCHA v3 sprawdzamy score
    if (score !== undefined && score < RECAPTCHA_MIN_SCORE) {
      console.warn(`reCAPTCHA score too low: ${score}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
};
