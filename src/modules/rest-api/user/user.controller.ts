import { UserRestApiDto } from "@/modules/rest-api/user/dto/user.dto";
import { UserRestApiService } from "@/modules/rest-api/user/user.service";
import { Controller, Get, Query } from "@nestjs/common";

import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { ApiServiceResponse } from "src/common/type/api-service.type";
import { GetRestApiUserInput } from "./dto/get-user.dto";

@ApiTags("users")
@Controller("users")
export class UserRestApiController {
  constructor(private readonly userService: UserRestApiService) {}

  @Get()
  @ApiResponse({ status: 200, type: UserRestApiDto })
  async getUser(
    @Query() input: GetRestApiUserInput
  ): Promise<ApiServiceResponse> {
    return this.userService.getUserById(input.id);
  }
}
