import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1),
  AUTH_MICROSOFT_ENTRA_ID_ID: z.string().min(1),
  AUTH_MICROSOFT_ENTRA_ID_SECRET: z.string().min(1),
  AUTH_MICROSOFT_ENTRA_ID_TENANT_ID: z.string().min(1),
  ALLOWED_TENANT_ID: z.string().min(1),
  ALLOWED_USER_OBJECT_ID: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => i.path.join("."))
      .join(", ");
    throw new Error(
      `Missing or invalid environment variables: ${missing}. ` +
        `Check .env.local against .env.example.`
    );
  }
  return result.data;
}

export const env = validateEnv();
