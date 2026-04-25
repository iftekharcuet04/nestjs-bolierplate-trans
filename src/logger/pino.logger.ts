import pino, { TransportTargetOptions } from "pino";
import path from "path";

const DIR_NAME = __dirname;

const createFileTransportTarget = (level: string): TransportTargetOptions => ({
  target: path.join(DIR_NAME, "pino.transport.js"),
  level,
  options: {
    destination: path.join(process.cwd(), "logs", "api.errors.log")
  }
});

// Ensure logs directory exists
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const createDatabaseTransportTarget = (
  level: string
): TransportTargetOptions => ({
  target: path.join(DIR_NAME, "database.transport.js"),
  level
});

const createRollbarTransportTarget = (
  level: string
): TransportTargetOptions => ({
  target: path.join(DIR_NAME, "rollbar.transport.js"),
  level
});

const useDbLogging = process.env.LOG_TO_DB === "1";

const targets: TransportTargetOptions[] = [
  {
    level: process.env.LOG_LEVEL || "info",
    target: "pino/file",
    options: {
      destination: 1
    }
  },
  ...(useDbLogging
    ? [
        createDatabaseTransportTarget("error"),
        createDatabaseTransportTarget("warn"),
        createDatabaseTransportTarget("info")
      ]
    : [
        createFileTransportTarget("error"),
        createFileTransportTarget("warn"),
        createFileTransportTarget("debug")
      ]),
  ...(process.env.SLF_ROLLBAR_ACCESS_TOKEN
    ? [
        createRollbarTransportTarget("error"),
        createRollbarTransportTarget("warn"),
        createRollbarTransportTarget("debug")
      ]
    : [])
];

const transport = pino.transport({
  targets
});

export const logger = pino(transport);
