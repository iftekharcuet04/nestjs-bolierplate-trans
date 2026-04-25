import { Module } from "@nestjs/common";
import { UserRestApiController } from "./user.controller";
import { UserRestApiService } from "./user.service";
import { UserModule } from "src/modules/user/user.module";

@Module({
  imports: [UserModule],
  controllers: [UserRestApiController],
  providers: [UserRestApiService],
  exports: [UserRestApiService]
})
export class UserRestApiModule {}
