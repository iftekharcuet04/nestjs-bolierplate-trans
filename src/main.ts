// import { fastifyMultipart } from "@fastify/multipart";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication
} from "@nestjs/platform-fastify";
import type { IncomingMessage } from "http";

import hyperid from "hyperid";
import { Logger } from "nestjs-pino";

// import { RedisIoAdapter } from "@/modules/sockets/ioredis.adapter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

function getFastifyAdapter() {
  // universally unique id for request context
  const getUniqueId = hyperid({ urlSafe: true });

  const fastifyAdapter = new FastifyAdapter({
    bodyLimit: 1048576,
    genReqId(req: IncomingMessage): string {
      let requestId: string = req.headers["request-id"] as string;
      if (!requestId) {
        requestId = getUniqueId();
      }
      return requestId;
    }
  });

  return fastifyAdapter;
}

function setupSwagger(app: NestFastifyApplication) {
  const APP_MODE =
    process.env.NODE_ENV || process.env.APP_ENVIRONMENT || "development";
  console.log("App running on ==> ", APP_MODE);

  if (APP_MODE !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Boilerplate API")
      .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
      .setDescription(`The Local Fans ${APP_MODE} API Documentation`)
      .setVersion("0.0.1")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(process.env.API_PREFIX, app, document);
  }
}

async function bootstrap() {
  // create nestjs app with fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,

    getFastifyAdapter(),
    // disable if app crashes without any output
    { bufferLogs: true, rawBody: true, bodyParser: true }
  );
  app.useGlobalInterceptors();
  // setup logging

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();

  // listener for unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // Ensure the process doesn't exit
  });

  // get port, api version from configService
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>("api.port");
  const version = configService.get<string>("api.version");
  const apiPrefix = configService.get<string>("api.apiPrefix");

  // global filters
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true
    })
  );
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    defaultVersion: version,
    type: VersioningType.URI
  });

  setupSwagger(app);

  await app.listen(port, "0.0.0.0");
}

bootstrap();
