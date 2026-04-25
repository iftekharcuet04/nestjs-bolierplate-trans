import { HttpException, Injectable } from "@nestjs/common";
import { UserRepository } from "src/modules/user/user.repository";
import { returnSuccess } from "src/common/helpers/response-handler.helper";
import { ApiServiceResponse } from "src/common/type/api-service.type";

@Injectable()
export class UserRestApiService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(id: number): Promise<ApiServiceResponse> {
    const user = await this.userRepository.findUnique({
      where: { id }
    });

    if (!user) {
      throw new HttpException("USER_FETCH_ERROR", 400);
    }

    return returnSuccess(200, "USER_FETCH_SUCCESS", user);
  }
}
