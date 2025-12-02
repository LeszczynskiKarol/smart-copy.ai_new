// backend/src/services/auth.service.ts
import { PrismaClient } from "@prisma/client";
import { verifyGoogleToken } from "./google-auth.service";
import bcrypt from "bcrypt";
import { addMinutes, addHours } from "date-fns";
import {
  generateVerificationCode,
  generateToken,
  sanitizeEmail,
  isEmailValid,
  isPasswordStrong,
  AppError,
  errorMessages,
} from "../utils/helpers";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.service";
import { verifyRecaptcha } from "../utils/recaptcha";
import {
  RegisterInput,
  VerifyCodeInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../types";

const prisma = new PrismaClient();

const EMAIL_RESEND_COOLDOWN = parseInt(
  process.env.EMAIL_RESEND_COOLDOWN || "2"
);

export class AuthService {
  async register(data: RegisterInput) {
    const {
      email,
      password,
      firstName,
      lastName,
      acceptedTerms,
      recaptchaToken,
    } = data;

    // Weryfikacja reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      throw new AppError(400, errorMessages.RECAPTCHA_FAILED);
    }

    // Walidacja email
    const sanitizedEmail = sanitizeEmail(email);
    if (!isEmailValid(sanitizedEmail)) {
      throw new AppError(400, errorMessages.INVALID_EMAIL);
    }

    // Walidacja hasła
    if (!isPasswordStrong(password)) {
      throw new AppError(400, errorMessages.WEAK_PASSWORD);
    }

    // Walidacja akceptacji regulaminu
    if (!acceptedTerms) {
      throw new AppError(400, errorMessages.TERMS_NOT_ACCEPTED);
    }

    // Sprawdzenie czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: {
        verificationCodes: {
          where: {
            type: "EMAIL_VERIFICATION",
            isUsed: false,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (existingUser) {
      // Użytkownik istnieje ale nie jest zweryfikowany
      if (!existingUser.isVerified) {
        const lastCode = existingUser.verificationCodes[0];

        // Sprawdzenie czy nie minął cooldown
        if (lastCode) {
          const timeSinceLastCode = Date.now() - lastCode.createdAt.getTime();
          const cooldownMs = EMAIL_RESEND_COOLDOWN * 60 * 1000;

          if (timeSinceLastCode < cooldownMs) {
            const remainingMinutes = Math.ceil(
              (cooldownMs - timeSinceLastCode) / 60000
            );
            throw new AppError(
              429,
              `Kod weryfikacyjny został już wysłany. Możesz poprosić o nowy kod za ${remainingMinutes} minut(y).`,
              "RATE_LIMIT"
            );
          }
        }

        // Wygenerowanie nowego kodu
        const code = generateVerificationCode();
        const expiresAt = addMinutes(new Date(), 15);

        await prisma.verificationCode.create({
          data: {
            userId: existingUser.id,
            code,
            type: "EMAIL_VERIFICATION",
            expiresAt,
          },
        });

        await sendVerificationEmail(
          sanitizedEmail,
          code,
          existingUser.firstName || undefined
        );

        return {
          message: "Kod weryfikacyjny został ponownie wysłany",
          email: sanitizedEmail,
          resent: true,
        };
      }

      throw new AppError(400, errorMessages.EMAIL_EXISTS);
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tworzenie użytkownika
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        firstName,
        lastName,
        acceptedTerms,
        isVerified: false,
      },
    });

    // Generowanie kodu weryfikacyjnego
    const code = generateVerificationCode();
    const expiresAt = addMinutes(new Date(), 15);

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    // Wysyłanie emaila
    await sendVerificationEmail(sanitizedEmail, code, firstName);

    return {
      message: "Rejestracja pomyślna. Sprawdź swoją skrzynkę email.",
      email: sanitizedEmail,
      userId: user.id,
    };
  }

  async verifyEmail(data: VerifyCodeInput) {
    const { email, code } = data;
    const sanitizedEmail = sanitizeEmail(email);

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: {
        verificationCodes: {
          where: {
            code,
            type: "EMAIL_VERIFICATION",
            isUsed: false,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new AppError(404, errorMessages.USER_NOT_FOUND);
    }

    if (user.isVerified) {
      throw new AppError(400, "Email już został zweryfikowany");
    }

    const verificationCode = user.verificationCodes[0];

    if (!verificationCode) {
      throw new AppError(400, errorMessages.INVALID_CODE);
    }

    // Sprawdzenie czy kod wygasł
    if (verificationCode.expiresAt < new Date()) {
      throw new AppError(400, errorMessages.CODE_EXPIRED);
    }

    // Oznaczenie kodu jako użytego
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { isUsed: true },
    });

    // Weryfikacja użytkownika
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        lastLoginAt: new Date(),
      },
    });

    // Generowanie tokenów JWT
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      message: "Email zweryfikowany pomyślnie",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async login(data: LoginInput) {
    const { email, password, recaptchaToken } = data;

    // Weryfikacja reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      throw new AppError(400, errorMessages.RECAPTCHA_FAILED);
    }

    const sanitizedEmail = sanitizeEmail(email);

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      throw new AppError(401, errorMessages.INVALID_CREDENTIALS);
    }

    // Sprawdzenie hasła
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, errorMessages.INVALID_CREDENTIALS);
    }

    // Sprawdzenie czy email jest zweryfikowany
    if (!user.isVerified) {
      throw new AppError(403, errorMessages.EMAIL_NOT_VERIFIED);
    }

    // Aktualizacja ostatniego logowania
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generowanie tokenów
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      message: "Logowanie pomyślne",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async resendVerificationCode(email: string, recaptchaToken: string) {
    // Weryfikacja reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      throw new AppError(400, errorMessages.RECAPTCHA_FAILED);
    }

    const sanitizedEmail = sanitizeEmail(email);

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: {
        verificationCodes: {
          where: {
            type: "EMAIL_VERIFICATION",
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new AppError(404, errorMessages.USER_NOT_FOUND);
    }

    if (user.isVerified) {
      throw new AppError(400, "Email już został zweryfikowany");
    }

    // Sprawdzenie rate limit
    const lastCode = user.verificationCodes[0];
    if (lastCode) {
      const timeSinceLastCode = Date.now() - lastCode.createdAt.getTime();
      const cooldownMs = EMAIL_RESEND_COOLDOWN * 60 * 1000;

      if (timeSinceLastCode < cooldownMs) {
        const remainingMinutes = Math.ceil(
          (cooldownMs - timeSinceLastCode) / 60000
        );
        throw new AppError(
          429,
          `Kod weryfikacyjny został już wysłany. Możesz poprosić o nowy kod za ${remainingMinutes} minut(y).`
        );
      }
    }

    // Generowanie nowego kodu
    const code = generateVerificationCode();
    const expiresAt = addMinutes(new Date(), 15);

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    await sendVerificationEmail(
      sanitizedEmail,
      code,
      user.firstName || undefined
    );

    return {
      message: "Nowy kod weryfikacyjny został wysłany",
      email: sanitizedEmail,
    };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const { email, recaptchaToken } = data;

    // Weryfikacja reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      throw new AppError(400, errorMessages.RECAPTCHA_FAILED);
    }

    const sanitizedEmail = sanitizeEmail(email);

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Dla bezpieczeństwa zawsze zwracamy sukces, nawet jeśli użytkownik nie istnieje
    if (!user) {
      return {
        message:
          "Jeśli podany email istnieje w systemie, zostanie wysłany link do resetowania hasła",
      };
    }

    // Generowanie tokenu resetu hasła
    const token = generateToken();
    const expiresAt = addHours(new Date(), 1);

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await sendPasswordResetEmail(
      sanitizedEmail,
      token,
      user.firstName || undefined
    );

    return {
      message:
        "Jeśli podany email istnieje w systemie, zostanie wysłany link do resetowania hasła",
    };
  }

  async resetPassword(data: ResetPasswordInput) {
    const { token, password } = data;

    // Walidacja hasła
    if (!isPasswordStrong(password)) {
      throw new AppError(400, errorMessages.WEAK_PASSWORD);
    }

    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!passwordReset) {
      throw new AppError(400, errorMessages.INVALID_TOKEN);
    }

    if (passwordReset.isUsed) {
      throw new AppError(400, "Token został już użyty");
    }

    if (passwordReset.expiresAt < new Date()) {
      throw new AppError(400, "Token wygasł");
    }

    // Hashowanie nowego hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Aktualizacja hasła i oznaczenie tokenu jako użytego
    await prisma.$transaction([
      prisma.user.update({
        where: { id: passwordReset.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { isUsed: true },
      }),
    ]);

    return {
      message: "Hasło zostało pomyślnie zmienione",
    };
  }

  async googleLogin(googleToken: string) {
    const googleUser = await verifyGoogleToken(googleToken);

    if (!googleUser?.email) {
      throw new AppError(400, "Nieprawidłowe dane Google");
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: googleUser.email }, { googleId: googleUser.sub }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          googleId: googleUser.sub,
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          isVerified: true,
          acceptedTerms: true,
          password: await bcrypt.hash(Math.random().toString(36), 10),
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.sub },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      message: "Logowanie Google pomyślne",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Sprawdź czy użytkownik nadal istnieje
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new AppError(401, "Użytkownik nie istnieje");
      }

      // Wygeneruj nowe tokeny
      const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });
      const newRefreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError(401, "Nieprawidłowy refresh token");
    }
  }
}
