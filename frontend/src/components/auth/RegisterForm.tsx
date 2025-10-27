// frontend/src/components/auth/Registerform.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "@/services/auth.service";
import { executeRecaptcha } from "@/lib/recaptcha";
import { handleApiError } from "@/lib/api";

const registerSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z
      .string()
      .email("Nieprawidłowy adres email")
      .min(1, "Email jest wymagany"),
    password: z
      .string()
      .min(8, "Hasło musi mieć minimum 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
      .regex(/[a-z]/, "Hasło musi zawierać małą literę")
      .regex(/[0-9]/, "Hasło musi zawierać cyfrę"),
    confirmPassword: z.string().min(1, "Potwierdź hasło"),
    acceptedTerms: z.boolean().refine((val) => val === true, {
      message: "Musisz zaakceptować regulamin",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  // Walidacja hasła w czasie rzeczywistym
  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      // Wykonaj reCAPTCHA
      const recaptchaToken = await executeRecaptcha("register");

      // Rejestracja
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        acceptedTerms: data.acceptedTerms,
        recaptchaToken,
      });

      toast.success(response.message);

      // Przekierowanie do weryfikacji
      navigate("/verify", { state: { email: data.email } });
    } catch (error) {
      const errorMessage = handleApiError(error);

      // Sprawdzenie czy to błąd rate limit
      if (errorMessage.includes("Kod weryfikacyjny został już wysłany")) {
        toast.error(errorMessage, { duration: 5000 });
        navigate("/verify", { state: { email: data.email } });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Utwórz konto
          </h1>
          <p className="text-gray-600">
            Rozpocznij swoją przygodę z AI już dziś
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Imię i nazwisko */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imię (opcjonalne)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register("firstName")}
                  type="text"
                  placeholder="Jan"
                  className="input pl-10"
                />
              </div>
            </div>
            {/*<div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazwisko (opcjonalne)
              </label>
              <input
                {...register("lastName")}
                type="text"
                placeholder="Kowalski"
                className="input"
              />
            </div>*/}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("email")}
                type="email"
                placeholder="jan.kowalski@example.com"
                className={`input pl-10 ${errors.email ? "input-error" : ""}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Hasło */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasło
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`input pl-10 pr-10 ${
                  errors.password ? "input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}

            {/* Siła hasła */}
            {password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      passwordStrength.hasMinLength
                        ? "text-green-500"
                        : "text-gray-300"
                    }`}
                  />
                  <span
                    className={
                      passwordStrength.hasMinLength
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    Minimum 8 znaków
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      passwordStrength.hasUpperCase
                        ? "text-green-500"
                        : "text-gray-300"
                    }`}
                  />
                  <span
                    className={
                      passwordStrength.hasUpperCase
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    Wielka litera
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      passwordStrength.hasLowerCase
                        ? "text-green-500"
                        : "text-gray-300"
                    }`}
                  />
                  <span
                    className={
                      passwordStrength.hasLowerCase
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    Mała litera
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      passwordStrength.hasNumber
                        ? "text-green-500"
                        : "text-gray-300"
                    }`}
                  />
                  <span
                    className={
                      passwordStrength.hasNumber
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    Cyfra
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Potwierdzenie hasła */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Potwierdź hasło
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`input pl-10 pr-10 ${
                  errors.confirmPassword ? "input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Akceptacja regulaminu */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register("acceptedTerms")}
                type="checkbox"
                className="w-5 h-5 mt-0.5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">
                Akceptuję{" "}
                <Link to="/terms" className="text-purple-600 hover:underline">
                  regulamin
                </Link>{" "}
                oraz{" "}
                <Link to="/privacy" className="text-purple-600 hover:underline">
                  politykę prywatności
                </Link>
              </span>
            </label>
            {errors.acceptedTerms && (
              <p className="text-red-500 text-sm mt-1">
                {errors.acceptedTerms.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary py-3 text-lg disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Tworzenie konta...
              </>
            ) : (
              "Utwórz konto"
            )}
          </button>
        </form>

        {/* reCAPTCHA info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Ta strona jest chroniona przez reCAPTCHA Google.
        </p>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-6">
          Masz już konto?{" "}
          <Link
            to="/login"
            className="text-purple-600 hover:underline font-medium"
          >
            Zaloguj się
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
