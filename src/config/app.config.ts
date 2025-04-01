import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  databaseUrl: process.env.DATABASE_URL,
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
  awsSecretKey: process.env.AWS_SECRET_ACCEnSS_KEY,
  awsRegion: process.env.AWS_REGION,
  s3Bucket: process.env.S3_BUCKET,
  s3Endpoint: process.env.S3_ENDPOINT,
  awsS3ForcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  useRedisPassword: process.env.REDIS_USE_PASSWORD == "yes",
  accountServerApiBaseUrl: process.env.ACCOUNT_SERVER_API_BASE_URL,
  bullPruneAgeSeconds:
    parseInt(process.env.BULL_PRUNE_AGE_SECONDS, 10) || 24 * 60 * 60, // keep up to 24 hours
  bullPruneKeepCount: parseInt(process.env.BULL_PRUNE_KEEP_COUNT, 10) || 500, // keep up to 500 jobs
  jwtRefreshExpirationDays:
    parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS, 10) || 15,
  jwtAccessExpirationHours:
    parseInt(process.env.JWT_ACCESS_EXPIRATION_HOURS, 10) || 24,
  smtpUsername: process.env.SYSTEM_SMTP_USER_NAME,
  smtpPassword: process.env.SYSTEM_SMTP_PASSWORD,
  smtpPort: parseInt(process.env.SYSTEM_SMTP_PORT, 10) || 587,
  smtpHost: process.env.SYSTEM_SMTP_HOST,
  throttleTime: parseInt(process.env.THROTTLE_TTL, 10) || 60, // 1 minute (60 seconds)
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT, 10) || 300, // 300 requests per minute
  publicRequestApiKey: process.env.PUBLIC_REQUEST_API_KEY,
  takeTemporaryDataInDays:
    parseInt(process.env.TAKE_TEMPORARY_DATA_IN_DAYS, 10) || 10, // 10 day temporay data,
  app_environment: process.env.APP_ENVIRONMENT,
  coreServiceApiBaseUrl: process.env.CORE_SERVICE_API_BASE_URL,
  pdfServiceApiBaseUrl:
    process.env.PDF_SERVICE_API_BASE_URL ||
    "http://pdf-generate-service:7001/api/pdf-builder/v1/"
}));
