// backend/src/services/email.service.ts

import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || "eu-north-1";
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@smart-copy.ai";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Smart-Copy.ai";
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://app-reactapp.ngrok.app";

// SES Client
const sesClient = new SESv2Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  },
});

export const sendVerificationEmail = async (
  email: string,
  code: string,
  firstName?: string
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
        .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Smart-Copy.ai</h1>
          <p>Witamy w świecie inteligentnej generacji treści</p>
        </div>
        <div class="content">
          <h2>Cześć ${firstName || "Użytkowniku"}! 👋</h2>
          <p>Dziękujemy za rejestrację w Smart-Copy.ai! Aby dokończyć proces rejestracji, wprowadź poniższy kod weryfikacyjny:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p>Kod jest ważny przez <strong>15 minut</strong>.</p>
          
          <p>Jeśli nie rejestrowałeś się w Smart-Copy.ai, zignoruj tę wiadomość.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Potrzebujesz pomocy? Skontaktuj się z nami: support@smart-copy.ai
            </p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2025 Smart-Copy.ai. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const params = {
    FromEmailAddress: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
    Destination: {
      ToAddresses: [email],
    },
    Content: {
      Simple: {
        Subject: {
          Data: "🔐 Twój kod weryfikacyjny - Smart-Copy.ai",
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: "UTF-8",
          },
          Text: {
            Data: `Witaj ${
              firstName || "Użytkowniku"
            }!\n\nTwój kod weryfikacyjny: ${code}\n\nKod jest ważny przez 15 minut.\n\nJeśli nie rejestrowałeś się w Smart-Copy.ai, zignoruj tę wiadomość.`,
            Charset: "UTF-8",
          },
        },
      },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Nie udało się wysłać emaila weryfikacyjnego");
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  firstName?: string
): Promise<void> => {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Reset hasła</h1>
        </div>
        <div class="content">
          <h2>Cześć ${firstName || "Użytkowniku"}!</h2>
          <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w Smart-Copy.ai.</p>
          
          <p>Kliknij poniższy przycisk, aby ustawić nowe hasło:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Resetuj hasło</a>
          </div>
          
          <p>Link jest ważny przez <strong>1 godzinę</strong>.</p>
          
          <p>Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość - Twoje hasło pozostanie bez zmian.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Link nie działa? Skopiuj i wklej ten adres w przeglądarce:<br>
              <a href="${resetLink}" style="color: #667eea;">${resetLink}</a>
            </p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2025 Smart-Copy.ai. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const params = {
    FromEmailAddress: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
    Destination: {
      ToAddresses: [email],
    },
    Content: {
      Simple: {
        Subject: {
          Data: "🔒 Reset hasła - Smart-Copy.ai",
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: "UTF-8",
          },
          Text: {
            Data: `Witaj ${
              firstName || "Użytkowniku"
            }!\n\nAby zresetować hasło, kliknij w link:\n${resetLink}\n\nLink jest ważny przez 1 godzinę.`,
            Charset: "UTF-8",
          },
        },
      },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Nie udało się wysłać emaila resetującego hasło");
  }
};
