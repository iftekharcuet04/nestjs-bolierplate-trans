import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TasksService {
  constructor(
    private readonly configService: ConfigService
  ) {}

  onModuleInit() {
    if (
      this.configService.get<string>("app.app_environment") !== "development"
    ) {
      // To remove the job
      this.removeRepeatableJob();
      // To add the job: If you change the schedule time, remember to remove the old job first to avoid duplicates
      this.cronSetupSync();
      return true;
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  cronSetupReSync() {
  
    // re-sync cron setup
    this.cronSetupSync();
  }

  async cronSetupSync() {
    const time = new Date();
    console.log("======> Setting up repeatable job at", time);

  

   
  }

  async removeRepeatableJob() {
  }
}
