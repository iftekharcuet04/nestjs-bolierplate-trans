import { Module } from "@nestjs/common";
import { UserRestApiController } from "./user.controller";
import { UserRestApiService } from "./user.service";

@Module({
  controllers: [UserRestApiController],
  providers: [UserRestApiService],
  exports: [UserRestApiService]
})
export class UserRestApiModule {}
