import { HttpException, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  checkSystemStatus(): { message: string } {
    return { message: "OK, all good" };
  }

  getHealth(): { message: string } {
    return { message: "OK, all good" };
  }

  async getHealthDetails(): Promise<{
    status: string;
    message: string;
    details: any;
  }> {
    const allStatus = await Promise.allSettled([
      this.checkService("Prisma", this.checkPrisma()),
      this.checkService("Redis", this.checkRedis())
    ]);

    let overAllStatus = "UP";

    const details = allStatus.reduce((acc, result) => {
      const { value, status }: any = result;
      if (status === "fulfilled" && value.status == true) {
        acc[value.serviceName] = {
          isOkay: value.status
        };
      } else {
        overAllStatus = "DOWN";
        acc[value.serviceName] = {
          isOkay: false,
          error: value.status
        };
      }
      return acc;
    }, {});

    const response = {
      status: overAllStatus,
      message: `All services are ${overAllStatus == "DOWN" ? "not " : ""}healthy`,
      details: overAllStatus == "DOWN" ? details : undefined
    };
    if (overAllStatus == "UP") return response;
    throw new HttpException(response, 400);
  }

  private async checkService(
    serviceName: string,
    checkFunction: Promise<boolean | string>
  ): Promise<{
    serviceName: string;
    status: boolean | string;
    error?: string;
  }> {
    try {
      const status = await checkFunction;
      return { serviceName, status };
    } catch (error) {
      return { serviceName, status: error.message };
    }
  }

  private async checkPrisma(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return error.message;
    }
  }

  private async checkRedis(): Promise<boolean | string> {
    let password: string;

    const useRedisPassword = process.env.REDIS_USE_PASSWORD == "yes";
    if (useRedisPassword) {
      password = process.env.REDIS_PASSWORD;
    }

    const redis = new Redis({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
      password
    }); // Create a new Redis client

    try {
      // Set a test key-value pair
      await redis.set("healthCheck", "OK");

      // Get the value of the test key
      const value = await redis.get("healthCheck");

      // If the value is "OK", the connection is successful
      if (value === "OK") return true;

      console.error("Unexpected value received from Redis:", value);
      return "Unexpected value received from Redis:";
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      return error.message;
    } finally {
      // Remove the test key
      await redis.del("healthCheck");
      // Close the Redis connection
      redis.quit();
    }
  }
}
