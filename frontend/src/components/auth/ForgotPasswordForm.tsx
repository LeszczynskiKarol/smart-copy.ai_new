// frontend/src/components/auth/ForgotPasswordForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "@/services/auth.service";
import { executeRecaptcha } from "@/lib/recaptcha";
import { handleApiError } from "@/lib/api";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Nieprawidłowy adres email")
    .min(1, "Email jest wymagany"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const recaptchaToken = await executeRecaptcha("forgot_password");

      await authApi.forgotPassword({
        email: data.email,
        recaptchaToken,
      });

      setSentEmail(data.email);
      setEmailSent(true);
      toast.success("Link do resetowania hasła został wysłany!");
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card text-center bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">
            Sprawdź swoją skrzynkę
          </h1>
          <p className="text-gray-900 dark:text-gray-100 mb-4">
            Wysłaliśmy link do resetowania hasła na adres:
          </p>
          <p className="text-purple-600 font-medium mb-6">{sentEmail}</p>
          <p className="text-sm text-gray-900 dark:text-gray-200 mb-6">
            Link jest ważny przez 1 godzinę. Jeśli nie otrzymałeś wiadomości,
            sprawdź folder spam.
          </p>
          <Link to="/login" className="btn btn-primary w-full">
            Wróć do logowania
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="card bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-500">
        <div className="text-center mb-8 ">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Zapomniałeś hasła?
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Nie martw się, wyślemy Ci link do resetowania
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Adres email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("email")}
                type="email"
                placeholder="jan.kowalski@example.com"
                className={`input bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 pl-10 ${
                  errors.email ? "input-error" : ""
                }`}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
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
                Wysyłanie...
              </>
            ) : (
              "Wyślij link resetujący"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/login"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 mx-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" />
            Wróć do logowania
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
