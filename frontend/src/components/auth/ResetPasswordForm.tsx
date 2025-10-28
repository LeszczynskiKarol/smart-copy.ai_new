// frontend/src/components/auth/ResetPasswordForm.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "@/services/auth.service";
import { handleApiError } from "@/lib/api";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Hasło musi mieć minimum 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
      .regex(/[a-z]/, "Hasło musi zawierać małą literę")
      .regex(/[0-9]/, "Hasło musi zawierać cyfrę"),
    confirmPassword: z.string().min(1, "Potwierdź hasło"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast.error("Nieprawidłowy lub brakujący token resetowania hasła");
      navigate("/forgot-password");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        token,
        password: data.password,
      });

      toast.success("Hasło zostało zmienione pomyślnie!");
      navigate("/login");
    } catch (error) {
      toast.error(handleApiError(error));
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
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ustaw nowe hasło
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Wprowadź nowe, silne hasło dla swojego konta
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nowe hasło */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nowe hasło
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300"
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
                        : "text-gray-500 dark:text-gray-400"
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
                        : "text-gray-500 dark:text-gray-400"
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
                        : "text-gray-500 dark:text-gray-400"
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
                        : "text-gray-500 dark:text-gray-400"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Resetowanie...
              </>
            ) : (
              "Zresetuj hasło"
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};
