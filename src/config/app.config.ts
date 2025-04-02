import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  databaseUrl: process.env.DATABASE_URL,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  useRedisPassword: process.env.REDIS_USE_PASSWORD == "yes",
  bullPruneAgeSeconds:
    parseInt(process.env.BULL_PRUNE_AGE_SECONDS, 10) || 24 * 60 * 60, // keep up to 24 hours
  bullPruneKeepCount: parseInt(process.env.BULL_PRUNE_KEEP_COUNT, 10) || 500, // keep up to 500 jobs
  app_environment: process.env.APP_ENVIRONMENT
}));
