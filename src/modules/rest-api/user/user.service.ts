import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { returnSuccess } from "src/common/helpers/response-handler.helper";
import { ApiServiceResponse } from "src/common/type/api-service.type";

@Injectable()
export class UserRestApiService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: number): Promise<ApiServiceResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new HttpException("USER_FETCH_ERROR", 400);
    }

    return returnSuccess(200, "USER_FETCH_SUCCESS", user);
  }
}
