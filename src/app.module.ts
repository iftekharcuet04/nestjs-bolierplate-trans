import { Module, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { PrismaModule } from "nestjs-prisma";
import apiConfig from "@/config/api.config";
import appConfig from "@/config/app.config";
import { logger } from "@/logger/pino.logger";
import { BullModule } from "@nestjs/bullmq";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConcurrencyLimiterService } from "./common/services/concurrency-limiter.service";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { UserRestApiModule } from "./modules/rest-api/user/user.module";
import { UserModule } from "./modules/user/user.module";
import { RedisModule } from "./modules/redis/redis.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import prismaMiddleware from "./common/filters/prisma.middleware";
import { ResponseFormatInterceptor } from "./common/interceptors/response.interceptor";
import { TranslationService } from "./common/translation.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, apiConfig],
      isGlobal: true,
      cache: true
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        logger
      }
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        let password: string;
        const useRedisPassword = configService.get<string>(
          "app.useRedisPassword"
        );
        if (useRedisPassword) {
          password = configService.get<string>("app.redisPassword");
        }
        const bullPruneAgeSeconds = configService.get<number>(
          "app.bullPruneAgeSeconds"
        );
        const bullPruneKeepCount = configService.get<number>(
          "app.bullPruneKeepCount"
        );

        return {
          defaultJobOptions: {
            removeOnComplete: {
              age: bullPruneAgeSeconds,
              count: bullPruneKeepCount
            },
            attempts: 2,
            backoff: {
              type: "exponential",
              delay: 10 * 1000
            },
            timeout: 60000
          },
          limiter: {
            max: configService.get<number>("app.bullRateLimitMax") || 1000,
            duration:
              configService.get<number>("app.bullRateLimitDuration") || 1000
          },
          connection: {
            host: configService.get<string>("app.redisHost"),
            port: configService.get<number>("app.redisPort"),
            password,
            retryStrategy: (times) => Math.min(times * 50, 2000)
          }
        };
      },
      inject: [ConfigService]
    }),

    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [prismaMiddleware]
      }
    }),

    UserModule,
    UserRestApiModule,
    TasksModule,
    RedisModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TranslationService,
    ConcurrencyLimiterService,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (translationService: TranslationService) =>
        new ResponseFormatInterceptor(translationService),
      inject: [TranslationService]
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    }
  ]
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  onModuleInit() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes("connection_limit=")) {
      this.logger.warn(
        "ARCHITECTURAL ALERT: DATABASE_URL does not contain 'connection_limit'. " +
        "Please add '?connection_limit=20' to your connection string to prevent connection exhaustion."
      );
    }
  }
}
