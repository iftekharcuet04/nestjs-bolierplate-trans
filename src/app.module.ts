import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { PrismaModule } from "nestjs-prisma";
// config
import apiConfig from "@/config/api.config";
import appConfig from "@/config/app.config";

// logger
import { logger } from "@/logger/pino.logger";
// modules
import { BullModule } from "@nestjs/bullmq";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { RedisModule } from "./modules/redis/redis.module";
import { TasksModule } from "./modules/tasks/tasks.module";

import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import prismaMiddleware from "./common/filters/prisma.middleware";
import { ResponseFormatInterceptor } from "./common/interceptors/response.interceptor";
import { CustomErrorHandlingPlugin } from "./common/plugins/validation-error-plugin";
import { TranslationService } from "./common/translation.service";
import { GraphqlValidationFilter } from "./error/error-format.filter";
import { UserRestApiModule } from "./modules/rest-api/user/user.module";
import { UserModule } from "./modules/user/user.module";

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
            timeout: 60000 // Timeout jobs after 60 seconds
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
            retryStrategy: (times) => Math.min(times * 50, 2000) // Exponential backoff
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

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      debug: true,
      playground: false,
      path: `${process.env.API_PREFIX}/graphql`,
      plugins:
        process.env.APP_ENVIRONMENT === "production"
          ? [CustomErrorHandlingPlugin]
          : [
              CustomErrorHandlingPlugin,
              ApolloServerPluginLandingPageLocalDefault()
            ]
      /**
       * Custom error formatting for GraphQL errors.
       * @param error The error to format.
       * @returns The formatted error.
       */
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
    /**
     * Provides an instance of the translation service.
     */
    /**
     * Provides an instance of the response format interceptor.
     * This interceptor formats the response according to the global
     * error format filter.
     */

    {
      provide: APP_INTERCEPTOR,
      useFactory: (translationService: TranslationService) =>
        new ResponseFormatInterceptor(translationService),
      inject: [TranslationService]
    },
    {
      provide: APP_FILTER,
      useClass: GraphqlValidationFilter
    }
  ]
})
export class AppModule {}
