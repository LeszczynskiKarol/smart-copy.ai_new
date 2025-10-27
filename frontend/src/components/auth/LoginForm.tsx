// frontend/src/components/auth/LoginForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "@/services/auth.service";
import { executeRecaptcha } from "@/lib/recaptcha";
import { handleApiError } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  email: z
    .string()
    .email("Nieprawidłowy adres email")
    .min(1, "Email jest wymagany"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const recaptchaToken = await executeRecaptcha("login");

      const response = await authApi.login({
        email: data.email,
        password: data.password,
        recaptchaToken,
      });

      toast.success("Zalogowano pomyślnie!");

      if (response.accessToken && response.refreshToken && response.user) {
        setAuth(response.user, response.accessToken, response.refreshToken);
      }

      navigate("/dashboard");
    } catch (error: any) {
      const errorMessage = handleApiError(error);

      // Sprawdź czy to błąd niezweryfikowanego emaila
      if (errorMessage.includes("nie został zweryfikowany")) {
        toast.error(errorMessage);
        // Przekieruj do weryfikacji
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
            Witaj ponownie!
          </h1>
          <p className="text-gray-600">Zaloguj się do swojego konta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                autoComplete="email"
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Hasło
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-purple-600 hover:underline"
              >
                Zapomniałeś hasła?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`input pl-10 pr-10 ${
                  errors.password ? "input-error" : ""
                }`}
                autoComplete="current-password"
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary py-3 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Logowanie...
              </>
            ) : (
              "Zaloguj się"
            )}
          </button>
        </form>

        {/* reCAPTCHA info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Ta strona jest chroniona przez reCAPTCHA Google.
        </p>

        {/* Register Link */}
        <p className="text-center text-gray-600 mt-6">
          Nie masz konta?{" "}
          <Link
            to="/register"
            className="text-purple-600 hover:underline font-medium"
          >
            Zarejestruj się
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
