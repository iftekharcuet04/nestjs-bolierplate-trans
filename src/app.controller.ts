import {
  Controller,
  Get,
  UseGuards,
  VERSION_NEUTRAL,
  Version
} from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/health-details")
  @Version(VERSION_NEUTRAL)
  getHealthDetails(): Promise<any> {
    return this.appService.getHealthDetails();
  }

  @Get("/health")
  @Version(VERSION_NEUTRAL)
  getHealth(): { message: string } {
    return this.appService.getHealth();
  }
}
