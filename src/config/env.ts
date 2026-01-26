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
  PORT: number;
  NODE_ENV: NodeEnv;

  DATABASE_URL: string;

  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  URL: string;
  FRONT_END_URL: string;
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
  //
  PORT: Number(process.env.PORT) || 5000,
  // URL
  URL: getEnv("URL"),
  FRONT_END_URL: getEnv("FRONT_END_URL"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  BETTER_AUTH_URL: getEnv("BETTER_AUTH_URL"),
  BETTER_AUTH_SECRET: getEnv("BETTER_AUTH_SECRET"),
};
