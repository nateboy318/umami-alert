// lib/config/env.ts
import { z } from 'zod';

// Create a schema for environment variables
const envSchema = z.object({
    UMAMI_API_URL: z.string().url(),
    UMAMI_API_KEY: z.string().min(1),
    WEBSITE_ID: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    RECIPIENT_EMAIL: z.string().email(),
    FROM_EMAIL: z.string().email(),
    CRON_SCHEDULE: z.string().optional().default('0 9 * * *')
});

// Validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('Invalid environment configuration:', parsedEnv.error.errors);
    throw new Error('Invalid environment configuration');
}

// Export a type-safe configuration object
export const config = parsedEnv.data;

// Optional: Create a helper for type-safe environment access
export function getEnv<K extends keyof typeof config>(key: K): typeof config[K] {
    const value = config[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
}