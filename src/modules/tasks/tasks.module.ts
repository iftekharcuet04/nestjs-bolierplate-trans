import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { BullModule } from "@nestjs/bullmq";
import { RedisModule } from "../redis/redis.module";

import { TasksService } from "./tasks.service";

@Module({
  imports: [BullModule.registerQueue(), HttpModule, RedisModule],
  providers: [TasksService]
})
export class TasksModule {}
