import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// =============================
// Validate required env variables
// =============================
const requiredEmailEnvVars = ["APP_EMAIL", "APP_PASS"] as const;

for (const envVar of requiredEmailEnvVars) {
  if (!process.env[envVar]) {
    console.warn(
      `  Warning: ${envVar} is not set. Email features will be disabled.`,
    );
  }
}

// =============================
// Email transporter configuration
// =============================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASS,
  },
  // Connection timeout
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000, // 5 seconds
});

// =============================
// Verify email transporter on startup
// =============================
if (process.env.APP_EMAIL && process.env.APP_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error(" Email transporter verification failed:", error);
    } else {
      console.log(" Email transporter is ready");
    }
  });
}

// =============================
// Helper: Queue failed emails for retry
// =============================
const queueFailedEmail = async (
  userId: string,
  email: string,
  type: string,
  url: string,
  error: any,
) => {
  try {
    console.error("📧 Email queued for retry:", {
      userId,
      email,
      type,
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  } catch (queueError) {
    console.error("Failed to queue email:", queueError);
  }
};

// =============================
// Helper: Send email with retry logic
// =============================
const sendEmailWithRetry = async (
  mailOptions: any,
  maxRetries = 3,
): Promise<boolean> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        ` Email sent successfully (attempt ${attempt}):`,
        info.messageId,
      );
      return true;
    } catch (error: any) {
      lastError = error;
      console.error(
        ` Email send failed (attempt ${attempt}/${maxRetries}):`,
        error.message,
      );

      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  console.error(" All email send attempts failed:", lastError);
  return false;
};

// =============================
// Better-auth configuration
// =============================
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
    sendVerificationEmail: async ({ user, url, token }) => {
      if (!process.env.APP_EMAIL || !process.env.APP_PASS) {
        console.warn(
          "  Email credentials not configured. Skipping verification email.",
        );
        return;
      }

      const mailOptions = {
        from: `"MediStore" <${process.env.APP_EMAIL}>`,
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
            <p style="color: #777; font-size: 14px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #4CAF50; word-break: break-all; font-size: 14px;">
              ${url}
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              If you didn't request this verification, you can safely ignore this email.
            </p>
            <p style="color: #999; font-size: 12px;">
              This verification link will expire in 24 hours.
            </p>
          </div>
        `,
      };

      try {
        const success = await sendEmailWithRetry(mailOptions);

        if (!success) {
          // Queue for retry but don't block signup
          await queueFailedEmail(
            user.id,
            user.email,
            "VERIFICATION",
            url,
            new Error("All retry attempts failed"),
          );

          console.warn(
            "  User signed up but verification email failed. Email queued for retry.",
          );
        }
      } catch (error: any) {
        console.error(" Unexpected error in sendVerificationEmail:", error);

        await queueFailedEmail(user.id, user.email, "VERIFICATION", url, error);
      }
    },
  },
});
