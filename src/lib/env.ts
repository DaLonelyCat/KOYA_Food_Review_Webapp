import { z } from "zod";

/**
 * Environment configuration schema
 * Validates all environment variables at startup
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().url(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // Base URL (public)
  NEXT_PUBLIC_BASE_URL: z.string().url(),

  // UploadThing
  NEXT_PUBLIC_UPLOADTHING_APP_ID: z.string().min(1),
  UPLOADTHING_SECRET: z.string().min(1),

  // Cron Secret (optional for dev)
  CRON_SECRET: z.string().optional(),
});

/**
 * Validated environment variables
 */
const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_UPLOADTHING_APP_ID: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID,
  UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
  CRON_SECRET: process.env.CRON_SECRET,
});

/**
 * Environment configuration object
 * Provides type-safe access to environment variables
 */
export const config = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",

  // Database
  database: {
    url: env.DATABASE_URL,
  },

  // Google OAuth
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackUrl: `${env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
  },

  // UploadThing
  uploadthing: {
    appId: env.NEXT_PUBLIC_UPLOADTHING_APP_ID,
    secret: env.UPLOADTHING_SECRET,
  },

  // Base URL
  baseUrl: env.NEXT_PUBLIC_BASE_URL,

  // Cron
  cron: {
    secret: env.CRON_SECRET || "dev-secret-change-in-production",
  },
} as const;

export default config;

