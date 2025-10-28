// frontend/src/components/auth/VerifyCodeForm.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "@/services/auth.service";
import { executeRecaptcha } from "@/lib/recaptcha";
import { handleApiError } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const verifySchema = z.object({
  code: z
    .string()
    .min(6, "Kod musi mieć 6 cyfr")
    .max(6, "Kod musi mieć 6 cyfr"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export const VerifyCodeForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Pobierz email ze state lub sessionStorage
    const stateEmail = location.state?.email;
    const storedEmail = sessionStorage.getItem("verification_email");

    if (stateEmail) {
      setEmail(stateEmail);
      sessionStorage.setItem("verification_email", stateEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.error("Brak informacji o emailu. Rozpocznij rejestrację ponownie.");
      navigate("/register");
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: VerifyFormData) => {
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await authApi.verify({
        email,
        code: data.code,
      });

      toast.success("Email zweryfikowany pomyślnie!");

      // Zapisz token i użytkownika
      if (response.accessToken && response.refreshToken && response.user) {
        setAuth(response.user, response.accessToken, response.refreshToken);
      }

      // Wyczyść sessionStorage
      sessionStorage.removeItem("verification_email");

      // Przekieruj do dashboardu
      navigate("/dashboard");
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || countdown > 0) return;

    setIsResending(true);
    try {
      const recaptchaToken = await executeRecaptcha("resend_code");

      await authApi.resendCode({
        email,
        recaptchaToken,
      });

      toast.success("Nowy kod weryfikacyjny został wysłany!");
      setCountdown(120); // 2 minuty cooldown
    } catch (error) {
      const errorMessage = handleApiError(error);

      // Sprawdź czy to błąd rate limit i wyciągnij liczbę minut
      const minutesMatch = errorMessage.match(/za (\d+) minut/);
      if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1]);
        setCountdown(minutes * 60);
      }

      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sprawdź swoją skrzynkę
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Wysłaliśmy kod weryfikacyjny na adres:
          </p>
          <p className="text-purple-600 font-medium mt-1">{email}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kod weryfikacyjny
            </label>
            <input
              {...register("code")}
              type="text"
              placeholder="000000"
              maxLength={6}
              className={`input text-center text-2xl tracking-widest font-bold ${
                errors.code ? "input-error" : ""
              }`}
              autoComplete="off"
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Weryfikacja...
              </>
            ) : (
              "Zweryfikuj email"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Nie otrzymałeś kodu?</p>
          <button
            onClick={handleResendCode}
            disabled={isResending || countdown > 0}
            className="text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Wysyłanie...
              </>
            ) : countdown > 0 ? (
              `Wyślij ponownie (${Math.floor(countdown / 60)}:${(countdown % 60)
                .toString()
                .padStart(2, "0")})`
            ) : (
              "Wyślij kod ponownie"
            )}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate("/register")}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do rejestracji
          </button>
        </div>
      </div>
    </motion.div>
  );
};
