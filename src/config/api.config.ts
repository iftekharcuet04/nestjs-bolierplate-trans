import { VERSION_NEUTRAL } from "@nestjs/common";
import { registerAs } from "@nestjs/config";

export default registerAs("api", () => ({
  port: parseInt(process.env.API_PORT, 10) || 4000,
  version: process.env.API_VERSION || VERSION_NEUTRAL,
  apiPrefix: process.env.API_PREFIX || "api"
}));
