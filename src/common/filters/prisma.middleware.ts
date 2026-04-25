import { Prisma } from "@prisma/client";
import { Logger } from "@nestjs/common";
import { ConcurrencyLimiterService } from "../services/concurrency-limiter.service";

const logger = new Logger("PrismaMiddleware");
const QUERY_TIMEOUT_MS = 2000;
const limiter = new ConcurrencyLimiterService();

const prismaMiddleware: Prisma.Middleware = async (params, next) => {
  const startTime = Date.now();
  
  const result = await limiter.run(async () => {
    return await next(params);
  });
  
  const duration = Date.now() - startTime;

  if (duration > QUERY_TIMEOUT_MS) {
    logger.warn(
      `CRITICAL: Query ${params.model}.${params.action} took ${duration}ms!`
    );
  }

  if (
    ["findUnique", "findFirst", "findMany", "create", "update"].includes(
      params.action
    )
  ) {
    if (Array.isArray(result)) {
      return result.map((item) => {
        if (item?.uid) item.uid = item.uid.toString("hex");
        return item;
      });
    } else if (result && result?.uid) {
      result.uid = result.uid.toString("hex");
    }
  }
  
  return result;
};

export default prismaMiddleware;
