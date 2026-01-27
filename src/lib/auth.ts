import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASS,
  },
});

// Better-auth configuration
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
      try {
        const info = await transporter.sendMail({
          from: `"Your App" <${process.env.APP_EMAIL}>`,
          to: user.email,
          subject: "Verify your email address",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                Email Verification
              </h2>
              <p style="color: #555; font-size: 16px;">Hello ${user.name || "User"},</p>
              <p style="color: #555; font-size: 16px;">
                Thank you for signing up! Please verify your email address by clicking the button below:
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
            </div>
          `,
        });

        console.log("✅ Verification email sent successfully:", info.messageId);
      } catch (error) {
        console.error("❌ Failed to send verification email:", error);
        throw error; // Important: throw error so better-auth can handle it
      }
    },
  },
});
