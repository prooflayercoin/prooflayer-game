import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().default(4000),
  API_HOST: z.string().default("0.0.0.0"),
  DEV_CHARACTER_ID: z
    .preprocess((v) => (v === "" ? undefined : v), z.string())
    .default("test-character-01"),
  OFFLINE_CATCHUP_CAP_HOURS: z.coerce.number().default(12),
  TICK_INTERVAL_MS: z.coerce.number().default(600),
  NODE_ENV: z.string().default("development"),
});

export const env = schema.parse({
  ...process.env,
  API_PORT: process.env.PORT || process.env.API_PORT,
});
export const OFFLINE_CAP_MS = env.OFFLINE_CATCHUP_CAP_HOURS * 60 * 60 * 1000;
