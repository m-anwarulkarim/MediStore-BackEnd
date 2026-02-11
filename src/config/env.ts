import dotenv from "dotenv";

dotenv.config();

/**
 * Allowed NODE_ENV values
 */
type NodeEnv = "development" | "production" | "test";

/**
 * Env shape (single source of truth)
 */
interface EnvConfig {
  NODE_ENV: NodeEnv;
  PORT?: number; // optional (Vercel friendly)

  DATABASE_URL: string;

  URL: string;
  FRONT_END_URL: string;

  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;

  // Email
  APP_EMAIL: string;
  APP_PASS: string;

  // Google OAuth
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  // Admin (optional in production after seed)
  ADMIN_EMAIL?: string;
  ADMIN_PASS?: string;
  ADMIN_NAME?: string;
}

/**
 * Read env safely
 */
function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }

  return value as string;
}

/**
 * Typed env object
 */
export const env: EnvConfig = {
  NODE_ENV: (process.env.NODE_ENV as NodeEnv) || "development",

  // PORT only for local/dev (not required in Vercel)
  PORT: process.env.PORT ? Number(process.env.PORT) : undefined,

  DATABASE_URL: getEnv("DATABASE_URL"),

  URL: getEnv("URL"),
  FRONT_END_URL: getEnv("FRONT_END_URL"),

  BETTER_AUTH_SECRET: getEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: getEnv("BETTER_AUTH_URL"),

  // Email
  APP_EMAIL: getEnv("APP_EMAIL"),
  APP_PASS: getEnv("APP_PASS"),

  // Google
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),

  // Admin (not required in production)
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASS: process.env.ADMIN_PASS,
  ADMIN_NAME: process.env.ADMIN_NAME,
};
