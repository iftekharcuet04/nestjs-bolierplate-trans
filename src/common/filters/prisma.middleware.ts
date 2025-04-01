import { hex2Uid } from "@/utils/converter";
import { Prisma } from "@prisma/client";

const prismaMiddleware: Prisma.Middleware = async (params, next) => {
  const result = await next(params);

  if (
    ["findUnique", "findFirst", "findMany", "create", "update"].includes(
      params.action
    )
  ) {
    if (Array.isArray(result) && result && result[0]?.uid) {
      return result.map((item) => {
        item.uid = item.uid.toString("hex");
        return item;
      });
    } else if (result && result?.uid) {
      result.uid = result.uid.toString("hex");
    }
    // } else if (params.args && params.args.where && params.args.where.uid) {
    //   params.args.where.uid = hex2Uid(params.args.where.uid);
  }
  return result;
};

export default prismaMiddleware;
