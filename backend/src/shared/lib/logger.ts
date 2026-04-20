import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "../config/env.config";

/**
 * Application-wide Winston logger instance.
 * - JSON format with timestamp
 * - Console transport (development)
 * - Daily rotate file transport (configurable via env)
 * - Levels: error, warn, info, debug
 */
const logger: winston.Logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      dirname: env.LOG_DIR,
      filename: "application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: `${env.LOG_RETENTION_DAYS}d`,
    }),
  ],
});

export { logger };
