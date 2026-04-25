import { FactoryProvider } from "@nestjs/common";
import { Redis } from "ioredis";

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: "RedisClient",

  useFactory: () => {
    let password: string;
    const useRedisPassword = process.env.REDIS_USE_PASSWORD == "yes";
    if (useRedisPassword) {
      password = process.env.REDIS_PASSWORD;
    }

    const port = Number(process.env.REDIS_PORT);
    const redisInstance = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: !isNaN(port) && port > 0 ? port : 6379,
      password
    });

    redisInstance.on("error", (e) => {
      throw new Error(`Redis connection failed: ${e}`);
    });

    return redisInstance;
  },
  inject: []
};
