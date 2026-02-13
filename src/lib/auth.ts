import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import nodemailer from "nodemailer";

import { prisma } from "./prisma";
import { env } from "../config/env";

/**
 * Helpers
 */
const normalizeOrigin = (u?: string) => (u ? u.replace(/\/$/, "") : "");

const isHttps = (u?: string) => Boolean(u && u.startsWith("https://"));

const isProd =
  env.NODE_ENV === "production" ||
  isHttps(env.BETTER_AUTH_URL) ||
  isHttps(env.FRONT_END_URL);

const trustedOrigins = [normalizeOrigin(env.FRONT_END_URL)].filter(Boolean);

/**
 * Email transporter (only if creds exist)
 */
const hasEmailCreds = Boolean(env.APP_EMAIL && env.APP_PASS);

const transporter = hasEmailCreds
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: env.APP_EMAIL,
        pass: env.APP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
    })
  : null;

if (!isProd && transporter) {
  transporter.verify((error) => {
    if (error) {
      console.error("Email transporter verification failed:", error);
    } else {
      console.log("Email transporter is ready");
    }
  });
}

/**
 * Queue failed emails (placeholder)
 */
const queueFailedEmail = async (
  userId: string,
  email: string,
  type: string,
  url: string,
  error: unknown,
) => {
  console.error("Email queued for retry:", {
    userId,
    email,
    type,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : error,
  });
};

type MailOptions = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

/**
 * Send email with retry logic
 */
const sendEmailWithRetry = async (
  mailOptions: MailOptions,
  maxRetries = 3,
): Promise<boolean> => {
  if (!transporter) return false;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `Email sent successfully (attempt ${attempt}):`,
        info.messageId,
      );
      return true;
    } catch (error) {
      lastError = error;
      console.error(
        `Email send failed (attempt ${attempt}/${maxRetries}):`,
        error instanceof Error ? error.message : error,
      );

      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error("All email send attempts failed:", lastError);
  return false;
};

/**
 * Better Auth config
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: normalizeOrigin(env.BETTER_AUTH_URL),

  trustedOrigins,

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 30 * 60,
    },
  },

  advanced: {
    cookiePrefix: "better-auth",

    useSecureCookies: isProd,

    defaultCookieAttributes: {
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      httpOnly: true,
      path: "/",
    },
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      prompt: "select_account consent",
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (!hasEmailCreds || !transporter) {
        console.warn(
          "Email credentials not configured. Skipping verification email.",
        );
        return;
      }

      const mailOptions: MailOptions = {
        from: `"MediStore" <${env.APP_EMAIL}>`,
        to: user.email,
        subject: "Verify your email address - MediStore",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
              Email Verification
            </h2>
            <p style="color: #555; font-size: 16px;">Hello ${user.name || "User"},</p>
            <p style="color: #555; font-size: 16px;">
              Thank you for signing up for MediStore! Please verify your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a
                href="${url}"
                target="_blank"
                style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;"
              >
                Verify Email
              </a>
            </div>
            <p style="color: #777; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #4CAF50; word-break: break-all; font-size: 14px;">${url}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              If you didn't request this verification, you can safely ignore this email.
            </p>
          </div>
        `,
      };

      const success = await sendEmailWithRetry(mailOptions);

      if (!success) {
        await queueFailedEmail(
          user.id,
          user.email,
          "VERIFICATION",
          url,
          new Error("All retry attempts failed"),
        );
        console.warn("User signed up but verification email failed.");
      }
    },
  },
});
